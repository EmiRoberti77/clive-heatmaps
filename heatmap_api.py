from flask import Flask, Response, url_for, render_template, request, redirect, jsonify
import numpy as np
import pandas as pd
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
import json
from sqlalchemy import create_engine, text
from flask_cors import CORS, cross_origin
import json
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage.filters import gaussian_filter
import pandas as pd
from PIL import Image
pd.options.display.float_format = '{:.3f}'.format

app = Flask(__name__)
CORS(app)


def get_ids(df, polys):
    idz = []
    for polyps in polys:
        # polyps=[[x,y] for x,y in zip(polyp[::2],polyp[1:][::2])]
        df['point'] = df.apply(lambda row: Point(row['x'], row['y']), axis=1)
        polygon = Polygon(polyps)
        df_1 = df[df['point'].apply(polygon.contains)].copy()
        idz += list(set(df_1['id'].to_list()))
    return set(idz)


def polygonfilter(df, polyp):
    # print(polyp)
    df2 = pd.DataFrame()
    df2['x'] = df['X']
    df2['y'] = df['Y']
    df2['id'] = df['Object id']
    df = df2.copy()
    if (len(polyp[0]) > 0):
        # polyp=[[x,y] for x,y in zip(polyp[::2],polyp[1:][::2])]
        # df['point'] = df.apply(lambda row: Point(row['x'],row['y']),axis=1)
        # polygon = Polygon(polyp)
        # df_1 = df[df['point'].apply(polygon.contains)].copy()
        ids = get_ids(df, polyp)  # set(df_1['id'].to_list())
        df_f = df.loc[df['id'].isin(ids)]
        df2 = df_f.copy()
        data = df2.drop(['id', 'point'], axis=1).to_numpy()
    data = df2.to_numpy()
    return data


def get_json(data, value):
    l = ["{ \"x\": "+str(i[0])+", \"y\": "+str(i[1]) +
         ", \"value\": "+str(value)+" }" for i in data.tolist()]
    out = "[ "+",".join(l)+" ]"
    return out


def heatmap_gen(image, df):
    heads = df.columns
    gaze_on_surf_x = df.x  # gaze_point_3d_x
    gaze_on_surf_y = df.y + .15  # norm_pos_y

    grid = image.shape[0:2]  # height, width of the loaded image
    # this will determine the gaussian blur kerner of the image (higher number = more blur)
    heatmap_detail = 0.05
    gaze_on_surf_y = 1 - gaze_on_surf_y
    hist, x_edges, y_edges = np.histogram2d(
        gaze_on_surf_y,
        gaze_on_surf_x,
        range=[[0, 1.0], [0, 1.0]],
        bins=grid
    )
    filter_h = int(heatmap_detail * grid[0])  # // 2 * 2 + 1
    filter_w = int(heatmap_detail * grid[1])  # // 2 * 2 + 1
    heatmap = gaussian_filter(hist, sigma=(filter_w, filter_h), order=0)
    fig = plt.figure()
    plt.imshow(image)
    plt.imshow(heatmap, cmap='jet', alpha=0.3)
    plt.axis('off')
    plt.close()
    fig.canvas.draw()
    data = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
    data = data.reshape(fig.canvas.get_width_height()[::-1] + (3,))
    img = Image.fromarray(data.astype('uint8'))

    # Convert the image to a base64 string
    from io import BytesIO
    import base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return Response(img_base64, mimetype='image/png')


def get_random_data():
    data = np.random.randint(low=0, high=[720, 480, 20], size=[400, 3])
    df = pd.DataFrame(data, columns=['x', 'y', 'id'])
    return df


def get_db(dbname='POS', tablename='Heatmapstore', user="postgres", password='dummy', host='localhost', port=5432, date='', stime='', etime=''):
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
    print(data, len(data))
    out = get_json(polygonfilter(get_db(dbname='POS', user="postgres", password='admin', host='localhost',
                   port=5432, date=date, stime=stime, etime=etime, tablename=tablename), data), strength)
    return out


if __name__ == "__main__":
    app.run(host="localhost", debug=True)
