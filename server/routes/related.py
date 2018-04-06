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

        cursor = yield from connect.cursor()

        yield from cursor.execute('''
            select
            snippet.id,
            snippet.post,
            snippet.mid,
            snippet.title,
            snippet.image,
            snippet.favors,
            snippet.name,
            snippet.romaji,
            favor.uid
            from(
                select 
                feed.id,
                feed.post,
                feed.mid,
                feed.title,
                feed.image,
                feed.favors,
                member.name,
                member.romaji
                from feed, member
                where feed.mid = (
                    select 
                    feed.mid 
                    from feed
                    where feed.id = %s
                )
                and feed.mid = member.id
                and feed.id != %s
                order by feed.post desc
                limit 0,10
            ) snippet
            left join favor on favor.uid = %s and favor.fid = snippet.id
        ''',(fid,fid,uid))

        data = yield from cursor.fetchall()
        yield from cursor.close()
        connect.close()

        if len(data) == 0:
            return web.HTTPNotFound()

        json_back = []

        for blog in data:

            json_back.append({
                "fid": str(blog[0]).zfill(7),
                "author":{
                    "mid": str(blog[2]).zfill(4),
                    "name": blog[6],
                    "romaji": blog[7],
                    "avatar": "/avatar/{}.jpg".format(blog[7])
                },
                "post": tool.time_utc(blog[1]),
                "title": blog[3],
                "image": blog[4].replace("hostpath","/thumb"),
                "favored": True if blog[8] else False,
                "favors": blog[5]
            })

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")

    return web.HTTPServiceUnavailable()
