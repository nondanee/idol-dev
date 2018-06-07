import asyncio
from . import tool
from aiohttp import web
from aiohttp_session import get_session

@asyncio.coroutine
def route(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        mid = int(parameters['mid'])
    except:
        return web.HTTPBadRequest()

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor()

        yield from cursor.execute('''
            select
            overview.id,
            overview.romaji,
            overview.name,
            overview.affiliation,
            overview.introduction,
            overview.follows,
            overview.subscribes,
            follow.uid,
            subscription.uid
            from (
                select
                member.id,
                member.romaji,
                member.name,
                member.affiliation,
                member.introduction,
                member.follows,
                member.subscribes
                from member
                where member.id = %s
            ) overview
            left join follow on follow.uid = %s and follow.mid = overview.id
            left join subscription on subscription.uid = %s and subscription.mid = overview.id
        ''',(mid,uid,uid))

        data = yield from cursor.fetchone()
        yield from cursor.close()
        connect.close()

        if not data:
            return web.HTTPNotFound()

        json_back = {
            "mid": str(data[0]).zfill(4),
            "avatar": "/avatar/{}.jpg".format(data[1]),
            "name": data[2],
            "romaji": data[1],
            "affiliation": data[3],
            "introduction": data[4],
            "follows": data[5],
            "subscribes": data[6],
            "followed": True if data[7] else False,
            "subscribed": True if data[8] else False
        }

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")