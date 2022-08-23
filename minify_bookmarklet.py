import re
import requests
import sys

with open('MSBookmarklet.js') as input:
  print('* Opened MSBookmarklet.js')
  try:
    print('* Try removing outer code that is necessary for Bookmarklets but cannot be minified by services.')
    stripped = re.search('(?s)(?<=javascript: \(\(\) => {).*(?=}\)\(\))',  input.read()).group(0)
  except AttributeError:
    sys.exit('X: Could not remove outer Bookmarklet code.')

  print('* POST request to minify inner code.')
  req = requests.post('https://www.toptal.com/developers/javascript-minifier/api/raw', data={'input': stripped})
  if req.status_code == 200:
    print('* Online minification was successful.')
    minified_w_spaces = req.text
    print('* There are still unnecessary spaces inside the minified code. Will be removed now...')
    minified = re.sub('\s{2,}', '', minified_w_spaces)
    with open ('MSBookmarklet.min.js', 'w') as output:
      print('* Spaces removed. Now, inserting outer code again and saving to file.')
      output.writelines('javascript:(()=>{{{}}})()'.format(minified))
      print('* Minification done.')

  else:
    sys.exit('X: Error code from JS minifier API.')
