import pytz, datetime, json

def time_utc(time_set):
    # jptime = timeset.replace(tzinfo=pytz.timezone("Asia/Tokyo"))
    jp_time = pytz.timezone('Asia/Tokyo').localize(time_set)
    return jp_time.astimezone(pytz.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def jsonify(json_dict):
    return json.dumps(json_dict,ensure_ascii=False,sort_keys=True)