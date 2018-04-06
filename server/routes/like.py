import asyncio
import json
from aiohttp import web
from aiohttp_session import get_session

@asyncio.coroutine
def create(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        fid = int(parameters['fid'])
    except:
        return web.HTTPBadRequest()

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor()

        try:
            yield from cursor.execute(
                'insert into favor values (%s,%s)',
                (uid,fid)
            )
            yield from connect.commit()
        except Exception as error:
            print(error)
            if error.args[1].find('member') != -1:
                return web.HTTPBadRequest()
            elif error.args[1].find('feed') != -1:
                session.clear()
                return web.HTTPBadRequest()
            elif error.args[1].find('Duplicate') != -1:
                return web.HTTPOk()

        yield from cursor.close()
        connect.close()
        return web.HTTPOk()

    return web.HTTPServiceUnavailable()



@asyncio.coroutine
def destroy(request):

    session = yield from get_session(request)
    parameters = request.rel_url.query

    if 'uid' not in session:
        return web.HTTPUnauthorized()
    else:
        uid = session['uid']

    try:
        fid = int(parameters['fid'])
    except:
        return web.HTTPBadRequest()

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor()

        deleted = yield from cursor.execute(
            'delete from favor where uid = %s and fid = %s',
            (uid,fid)
        )
        yield from connect.commit()
        yield from cursor.close()
        connect.close()

        if deleted:
            return web.HTTPOk()
        else:
            return web.HTTPBadRequest()

    return web.HTTPServiceUnavailable()