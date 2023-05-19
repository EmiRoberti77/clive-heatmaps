from flask import Flask, Response, url_for, render_template, request, redirect, jsonify, send_file
import numpy as np
import pandas as pd
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
import json
from sqlalchemy import create_engine, text
from flask_cors import CORS, cross_origin
import numpy as np
from PIL import Image
from io import BytesIO
import base64

pd.options.display.float_format = '{:.3f}'.format

app = Flask(__name__)
CORS(app)

images = [r"images\image1.jpg", r"images\image2.jpg", r"images\image3.jpg"]


def get_ids(df, polys):
    idz = []
    dfs = []
    idx = []
    for polyps in polys:
        # polyps=[[x,y] for x,y in zip(polyp[::2],polyp[1:][::2])]
        df['point'] = df.apply(lambda row: Point(row['X'], row['Y']), axis=1)
        polygon = Polygon(polyps)
        df_1 = df[df['point'].apply(polygon.contains)].copy()
        idz += list(set(df_1['Object id'].to_list()))
        idx.append(list(set(df_1['Object id'].to_list())))
        df_1 = df_1.drop(['point'], axis=1)
        dfs.append(df_1)
    # idz=set(idz)
    idz = idx[0]
    for lizt in idx[1:]:
        liz = []
        for z in idz:
            if (z in lizt):
                liz.append(z)
        idz = liz
    return [set(idz), idx, dfs]


def dwell_time(df, id):
    liz = df.loc[df['Object id'] == id]['time'].to_list()
    return [min(liz), max(liz)]


def gen_peeloff(data):

    d = {"Entered": {"A": 0, "B": 0}, "Exited": {
        "A": 0, "B": 0}, "Passerby": {"AB": 0, "BA": 0}}
    for i in data:
        path = data[i]
        if ('2' in path):
            if ('1' in path):
                path = path[0]+path[-1]
                if (path == '12'):
                    d["Entered"]['B'] += 1
                else:
                    d["Exited"]['B'] += 1

            else:
                path = path[0]+path[-1]
                if (path == '02'):
                    d["Entered"]['A'] += 1
                else:
                    d["Exited"]['A'] += 1
        else:
            path = path[0]+path[-1]
            if (path == '01'):
                d["Passerby"]['AB'] += 1
            else:
                d["Passerby"]['BA'] += 1
    d["Entered"]["total"] = d["Entered"]['A']+d["Entered"]['B']
    d["Exited"]["total"] = d["Exited"]['A']+d["Exited"]['B']
    d["Passerby"]["total"] = d["Passerby"]['AB']+d["Passerby"]['BA']
    d["Conversion"] = str(
        round((d["Entered"]["total"]/d["Passerby"]["total"])*100))+"%"
    return d


def dwell_areas(dwell_times):
    allkeys = [j for i in dwell_times for j in i.keys()]
    d = {i: {} for i in allkeys}
    for id, keys in enumerate(dwell_times):
        for i in allkeys:
            if i in keys:
                d[i][id] = keys[i]
    return d


def dwell_path(dwell_time_area):
    d = {i: "" for i in dwell_time_area}
    for id in dwell_time_area:
        dd = dwell_time_area[id]
        tf = [j for i in dd.values() for j in i]
        tf.sort()
        tfid = {j: i for i in dd for j in dd[i]}
        d[id] = "".join([str(tfid[i]) for i in tf])
    return d


def polygonfilter(df, polyp):
    # print(polyp)
    # df2= pd.DataFrame()
    # df2['x']=df['X']
    # df2['y']=df['Y']
    # df2['id']=df['Object id']
    # df2['time']=df['time']
    # df=df2.copy()
    data = df.copy()
    dfs = []
    idx = []
    if (len(polyp[0]) > 0):
        # print(len(polyp[0]))
        # polyp=[[x,y] for x,y in zip(polyp[::2],polyp[1:][::2])]
        # df['point'] = df.apply(lambda row: Point(row['x'],row['y']),axis=1)
        # polygon = Polygon(polyp)
        # df_1 = df[df['point'].apply(polygon.contains)].copy()
        ids, idx, dfs = get_ids(df, polyp)  # set(df_1['id'].to_list())
        df_f = df.loc[df['Object id'].isin(ids)]
        data = df_f.copy()
    return [data, idx, dfs]


def get_json(data, value):
    df2 = pd.DataFrame()
    df2['x'] = data['X']
    df2['y'] = data['Y']
    data = df2.to_numpy().tolist()
    # l=["{ \"x\": "+str(i[0])+", \"y\": "+str(i[1])+", \"value\": "+str(value)+" }" for i in data]
    out = [{"x": i[0], "y": i[1], "value": value}
           for i in data]  # "[ "+",".join(l)+" ]"
    return out


def image_bytes_gen(data):
    img = Image.fromarray(data.astype('uint8'))

    # Convert the image to a base64 string
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return Response(img_base64, mimetype='image/png')


def get_random_data():
    data = np.random.randint(low=0, high=[720, 480, 20], size=[400, 3])
    df = pd.DataFrame(data, columns=['X', 'Y', 'Object id'])
    return df


def get_db(dbname='POS', tablename='Heatmapstore', user="postgres", password='admin', host='localhost', port=5432, date='', stime='', etime=''):
    engine = create_engine(
        'postgresql://{}:{}@{}:{}/{}'.format(user, password, host, port, dbname))
    with engine.connect() as conn:
        query = 'SELECT * FROM public.\"{}\"'.format(tablename)
        if ((len(date) > 0) and (len(stime) > 0) and (len(etime) > 0)):
            query += ' WHERE date=\'{}\' AND time >= {} AND time <= {}'.format(
                date, stime, etime)
        df = pd.read_sql_query(text(query), conn)
        # print(query)
    return df


def return_site_json(df):
    d = {i: [] for i in set(df["site"].to_list())}
    dfs = [df.loc[df['site'].isin([i])] for i in d]
    for i, j in zip(d, dfs):
        for a, b, c in zip(j["camera"].to_list(), j["tablename"].to_list(), j["refImage"].to_list()):
            d[i].append({"camera": a, "tablename": b, "refImage": c})
    return d


def get_data():
    df2 = pd.read_csv("testdata.csv")
    df = pd.DataFrame()
    df['x'] = df2['X']
    df['y'] = df2['Y']
    df['id'] = df2['Object id']
    return df


@app.route('/api/heatmaps', methods=["POST", "GET"])
@cross_origin(origins='*')
def data_retiver():
    if request.method == 'POST':
        data = request.form['polygon']
        data = json.loads(data)
        date = request.form['date']
        stime = request.form['stime']
        etime = request.form['etime']
        image = request.files.get('imagefile', '')
    else:
        data = request.args.get('polygon')
        data = json.loads(data)[0]
        date = request.args.get('date')
        stime = request.args.get('stime')
        etime = request.args.get('etime')
        # image=None
        strength = request.args.get('strength')
        tablename = request.args.get('tablename')
    # out=heatmap_gen(image,polygonfilter(get_db(dbname='POS', user="postgres", password='dummy', host='localhost', port=5432, date=date, stime=stime, etime=etime), data))
    # out = [ date, stime, etime, request.method]
    # print(data,len(data))
    df = get_db(dbname='POS', user="postgres", password='admin', host='localhost',
                port=5432, date=date, stime=stime, etime=etime, tablename=tablename)
    # print(df)
    [df2, idz, dfz] = polygonfilter(df, data)
    hmap = get_json(df2, strength)
    peeloff = {}
    if (len(dfz) == 3):
        # print(idz)
        dts = [{i: dwell_time(dfz, i) for i in idx}
               for idx, dfz in zip(idz, dfz)]
        dta = dwell_areas(dts)
        path = dwell_path(dta)
        peeloff = gen_peeloff(path)
    out = {"heatmap_data": hmap, "peeloff_data": peeloff}
    return jsonify(out)


@app.route('/api/header')
@cross_origin(origins='*')
def frame_retiver():
    df = get_db(dbname='POS', user="postgres", password='dummy',
                host='localhost', port=5432, tablename="Heatmapsites")
    return jsonify(return_site_json(df))


if __name__ == "__main__":
    app.run(host="localhost", debug=True)
