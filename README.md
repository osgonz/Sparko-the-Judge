# CoProManager

## Getting started with Flask, MySQL and React
### Flask
1. Set up Flask environment, go to 'CoProManager/flask api' subfolder.
2. Make sure you have 'pip' installed. Using Python 3.6 for now, but we can switch to another version.
3. Open your terminal, and execute:
```
$ pip install -U Flask flask-mysql flask-cors
```
4. Make sure you have local MySQL installed.
5. Open 'app.py', modify MySQL configurations to the database of your choosing.
6. Modify and/or create Routes in your Flask API. See resources at the end for more info.
7. Execute in terminal:
```
$ python app.py
```
8. Check everything's working as expected.

### React
1. Set up React environment. Go back to your main project directory.
2 Make sure you have Node.js and 'npm' installed.
3. Go to your 'CoProManager/client' subfolder. Open a new terminal and execute:
```
$ npm start
```
4. Check everything's working as expected.
5. Go to your 'CoProManager/client/src' subfolder.
6. Open 'App.js', modify ComponentDidMount() to match a specific Flask API route. Feel free to test the fetched information to understand how the information is retrieved.
7. Go back to your opened React client tab on your browser from steps 3 and 4. See the new info?

### Summary
Flask API connects to MySQL DB, offers petinent data through specific 'routes'. React client fetches data from Flask API by accessing these predefined 'routes'.

## Resources
1. https://medium.com/python-pandemonium/build-simple-restful-api-with-python-and-flask-part-1-fae9ff66a706
2. https://developersoapbox.com/basic-web-api-using-flask-and-mysql/
3. https://flask-cors.readthedocs.io/en/latest/
4. https://reactjs.org/docs/create-a-new-react-app.html
5. https://blog.hellojs.org/fetching-api-data-with-react-js-460fe8bbf8f2
