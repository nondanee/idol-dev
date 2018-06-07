import time, datetime, json

def time_utc(time_set):
    utc_time = time_set + datetime.timedelta(seconds=-32400)
    return utc_time.strftime("%Y-%m-%dT%H:%M:%SZ")

def jsonify(json_dict):
    return json.dumps(json_dict,ensure_ascii=False,sort_keys=True)