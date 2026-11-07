import sqlite3,json
p='/opt/anlien-data/anlien.sqlite'
c=sqlite3.connect('file:'+p+'?mode=ro',uri=True)
print(json.dumps({'users':c.execute('select count(*) from users').fetchone()[0],'merit':list(c.execute('select coalesce(sum(wheel),0),coalesce(sum(incense),0),coalesce(sum(bows),0),coalesce(sum(sits),0) from merit').fetchone())}))
c.close()
