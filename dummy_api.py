from flask import Flask, Response, url_for, render_template, request, redirect,jsonify
import numpy as np
import pandas as pd
from shapely.geometry import Point
from shapely.geometry.polygon import Polygon
import json
from sqlalchemy import create_engine

app = Flask(__name__)

def polygonfilter(df,polyp):
    df['point'] = df.apply(lambda row: Point(row['x'],row['y']),axis=1)
    polygon = Polygon(polyp)
    df_1 = df[df['point'].apply(polygon.contains)].copy()
    ids = set(df_1['id'].to_list())
    df_f=df.loc[df['id'].isin(ids)]
    df2=df_f.copy()
    data=df2.drop(['id', 'point'], axis=1).to_numpy()
    l=["{ x: "+str(i[0])+", y: "+str(i[1])+",value: 0.8 }" for i in data.tolist()]
    out="[ "+",".join(l)+" ]"
    return out

def get_random_data():
    data= np.random.randint(low=0,high=[720,480,20],size=[400,3])
    df=pd.DataFrame(data, columns = ['x','y','id'])
    return df

def get_db(date,stime,etime):
    engine = create_engine('postgresql://xavier:nvidia@localhost:5432/valhalla')
    with engine.connect() as conn:
        pass

def get_data():
    df2=pd.read_csv("testdata.csv")
    df= pd.DataFrame()
    df['x']=df2['X']
    df['y']=df2['Y']
    df['id']=df2['Object id']
    return df


@app.route('/api/', methods=['POST','GET'])
def data_retiver():
    try:
        data = request.form['polygon']
        data = json.loads(data)
        [date,stime,etime]= json.loads(request.form['datetime'])
        #out=polygonfilter(get_db(date, stime, etime), data)
        return jsonify([data,date,stime,etime])
    except:
        return jsonify([request.method, json.dumps(request.form.keys())])



if __name__ == "__main__":
    app.run(host="localhost",debug=True)