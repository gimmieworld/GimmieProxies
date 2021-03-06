import gimmie
import sys
import os
from wsgiref.simple_server import make_server
client = gimmie.Client(oauth_key='GIMMIE_OAUTH_KEY', oauth_secret='OAUTH_SEC', url_prefix='https://api.gimmieworld.com')
# or simply "client = gimmie.Client()" if the config values are already set in environment variables OAUTH_KEY, OAUTH_SECRET, URL_PREFIX
url_suffix = len(sys.argv) > 1 and sys.argv[1] or '/1/stores.json'
player_uid = len(sys.argv) > 2 and sys.argv[2] or ''
print client.getJSON(url_suffix, player_uid)
