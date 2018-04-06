import asyncio
from . import tool
from aiohttp import web
from aiohttp_session import get_session

@asyncio.coroutine
def route(request):

    fid = request.match_info["fid"]

    session = yield from get_session(request)

    if 'uid' not in session:
        uid = -1
    else:
        uid = session['uid']

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor()

        yield from cursor.execute('''
            select
            specific_blog.id,
            specific_blog.post,
            specific_blog.mid,
            member.name,
            member.romaji,
            member.affiliation,
            specific_blog.link,
            specific_blog.title,
            specific_blog.favors,
            blog.text_original,
            favor.uid
            from (
                select
                feed.id,
                feed.post,
                feed.mid,
                feed.link,
                feed.title,
                feed.favors
                from feed
                where feed.id = %s
            ) specific_blog
            inner join blog on blog.id = specific_blog.id
            inner join member on member.id = specific_blog.mid
            left join favor on favor.uid = %s and favor.fid = specific_blog.id
        ''',(fid,uid))

        data = yield from cursor.fetchall()
        yield from cursor.close()
        connect.close()

        if len(data) == 0:
            return web.HTTPNotFound()
        else:
            data = data[0]

        json_back = {
            "fid": str(data[0]).zfill(7),
            "post": tool.time_utc(data[1]),
            "author":{
                "mid": str(data[2]).zfill(4),
                "name": data[3],
                "romaji": data[4],
                "affiliation": data[5],
                "avatar": "/avatar/{}.jpg".format(data[4])
            },
            "title": data[7],
            "link": data[6],
            "favored": True if data[10] else False,
            "favors": data[8],
            "text": data[9].replace("hostpath","/photo")
        }

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")

    return web.HTTPServiceUnavailable()
