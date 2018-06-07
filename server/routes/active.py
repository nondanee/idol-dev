import asyncio
import random, datetime
from aiohttp import web
from aiohttp_session import get_session

@asyncio.coroutine
def route(request):

    session = yield from get_session(request)

    user_agent = request.headers["User-Agent"]
    ip_address = request.headers["Remote-Host"]

    with (yield from request.app['pool']) as connect:

        cursor= yield from connect.cursor()

        if 'uid' not in session:

            while True:
                uid = random.randint(0,99999999)
                try:
                    yield from cursor.execute(
                        'insert into user values(%s,now(),%s,%s,"")',
                        (uid,ip_address,user_agent)
                    )
                    break
                except Exception as error:
                    print(error.args[1])
                    if error.args[1].find("key 'PRIMARY'") != -1:
                        continue
                    else:
                        return web.HTTPInternalServerError()
            session["uid"] = uid
        else:

            uid = session["uid"]
            try:
                updated = yield from cursor.execute(
                    'update user set last_active = now(),ip_address = %s,user_agent = %s where id = %s',
                    (ip_address,user_agent,uid)
                )
            except Exception as error:
                print(error)
                return web.HTTPInternalServerError()

            if updated:
                session["uid"] = uid
            else:
                session.clear()
        
        print(uid)
        yield from connect.commit()
        yield from cursor.close()
        connect.close()
        
        return web.HTTPNoContent()

    return web.HTTPServiceUnavailable()