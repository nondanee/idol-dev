import asyncio
from . import tool
from aiohttp import web
from aiohttp_session import get_session

@asyncio.coroutine
def all(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        page = int(parameters['page'])
    except:
        page = 1

    page = 1 if page < 1 else page

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor() 

        yield from cursor.execute('''
            select
            cut.id,
            cut.post,
            cut.mid,
            cut.title,
            cut.snippet,
            cut.image,
            cut.favors,
            cut.romaji,
            cut.name,
            cut.affiliation,
            favor.uid
            from(
                select
                feed.id,
                feed.post,
                feed.mid,
                feed.title,
                feed.snippet,
                feed.image,
                feed.favors,
                member.romaji,
                member.name,
                member.affiliation
                from feed, member
                where feed.mid = member.id
                order by feed.post desc, feed.mid desc
                limit %s,10  
            ) cut
            left join favor on favor.uid = %s and favor.fid = cut.id
        ''',((page-1)*10,uid))

        data = yield from cursor.fetchall()
        yield from cursor.close()
        connect.close()

        json_back = []

        for blog in data:

            json_back.append({
                "fid": str(blog[0]).zfill(7),
                "author":{
                    "mid": str(blog[2]).zfill(4),
                    "name": blog[8],
                    "romaji": blog[7],
                    "avatar": "/avatar/{}.jpg".format(blog[7]),
                    "affiliation": blog[9]
                },
                "post": tool.time_utc(blog[1]),                
                "title": blog[3],
                "snippet": blog[4],
                "image": blog[5].replace("hostpath","/thumb"),
                "favored": True if blog[10] else False,
                "favors": blog[6]
            })

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")


@asyncio.coroutine
def follow(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        page = int(parameters['page'])
    except:
        page = 1

    page = 1 if page < 1 else page

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor() 

        yield from cursor.execute('''
            select
            cut.id,
            cut.post,
            cut.mid,
            cut.title,
            cut.snippet,
            cut.image,
            cut.favors,
            cut.romaji,
            cut.name,
            cut.affiliation,
            favor.uid
            from(
                select
                feed.id,
                feed.post,
                feed.mid,
                feed.title,
                feed.snippet,
                feed.image,
                feed.favors,
                member.romaji,
                member.name,
                member.affiliation
                from feed, member
                where feed.mid in (
                    select 
                    mid
                    from follow
                    where uid = %s
                )
                and feed.mid = member.id
                order by feed.post desc, feed.mid desc
                limit %s,10  
            ) cut
            left join favor on favor.uid = %s and favor.fid = cut.id
        ''',(uid,(page-1)*10,uid))

        data = yield from cursor.fetchall()
        yield from cursor.close()
        connect.close()

        json_back = []

        for blog in data:

            json_back.append({
                "fid": str(blog[0]).zfill(7),
                "author":{
                    "mid": str(blog[2]).zfill(4),
                    "name": blog[8],
                    "romaji": blog[7],
                    "avatar": "/avatar/{}.jpg".format(blog[7]),
                    "affiliation": blog[9]
                },
                "post": tool.time_utc(blog[1]),                
                "title": blog[3],
                "snippet": blog[4],
                "image": blog[5].replace("hostpath","/thumb"),
                "favored": True if blog[10] else False,
                "favors": blog[6]
            })

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")


@asyncio.coroutine
def favor(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        page = int(parameters['page'])
    except:
        page = 1

    page = 1 if page < 1 else page

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor() 

        yield from cursor.execute('''
            select
            cut.id,
            cut.post,
            cut.mid,
            cut.title,
            cut.snippet,
            cut.image,
            cut.favors,
            cut.romaji,
            cut.name,
            cut.affiliation,
            favor.uid
            from(
                select
                feed.id,
                feed.post,
                feed.mid,
                feed.title,
                feed.snippet,
                feed.image,
                feed.favors,
                member.romaji,
                member.name,
                member.affiliation
                from feed, member
                where feed.id in (
                    select 
                    fid
                    from favor
                    where uid = %s
                ) 
                and feed.mid = member.id
                order by feed.post desc, feed.mid desc
                limit %s,10  
            ) cut
            left join favor on favor.uid = %s and favor.fid = cut.id
        ''',(uid,(page-1)*10,uid))

        data = yield from cursor.fetchall()
        yield from cursor.close()
        connect.close()

        json_back = []

        for blog in data:

            json_back.append({
                "fid": str(blog[0]).zfill(7),
                "author":{
                    "mid": str(blog[2]).zfill(4),
                    "name": blog[8],
                    "romaji": blog[7],
                    "avatar": "/avatar/{}.jpg".format(blog[7]),
                    "affiliation": blog[9]
                },
                "post": tool.time_utc(blog[1]),                
                "title": blog[3],
                "snippet": blog[4],
                "image": blog[5].replace("hostpath","/thumb"),
                "favored": True if blog[10] else False,
                "favors": blog[6]
            })

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")


@asyncio.coroutine
def member(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query
    mid = request.match_info["mid"]

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        mid = int(parameters['mid'])
    except:
        return web.HTTPBadRequest()

    try:
        page = int(parameters['page'])
    except:
        page = 1

    page = 1 if page < 1 else page

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor() 

        yield from cursor.execute('''
            select
            cut.id,
            cut.post,
            cut.mid,
            cut.title,
            cut.snippet,
            cut.image,
            cut.favors,
            cut.romaji,
            cut.name,
            cut.affiliation,
            favor.uid
            from(
                select
                feed.id,
                feed.post,
                feed.mid,
                feed.title,
                feed.snippet,
                feed.image,
                feed.favors,
                member.romaji,
                member.name,
                member.affiliation
                from feed, member
                where feed.mid = %s
                and feed.mid = member.id
                order by feed.post desc, feed.mid desc
                limit %s,10
            ) cut
            left join favor on favor.uid = %s and favor.fid = cut.id
        ''',(mid,(page-1)*10,uid))

        data = yield from cursor.fetchall()
        yield from cursor.close()
        connect.close()

        json_back = []

        for blog in data:

            json_back.append({
                "fid": str(blog[0]).zfill(7),
                "author":{
                    "mid": str(blog[2]).zfill(4),
                    "name": blog[8],
                    "romaji": blog[7],
                    "avatar": "/avatar/{}.jpg".format(blog[7]),
                    "affiliation": blog[9]
                },
                "post": tool.time_utc(blog[1]),
                "title": blog[3],
                "snippet": blog[4],
                "image": blog[5].replace("hostpath","/thumb"),
                "favored": True if blog[10] else False,
                "favors": blog[6]
            })

        return web.Response(text=tool.jsonify(json_back),content_type="application/json",charset="utf-8")