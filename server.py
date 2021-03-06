from flask import Flask, request, render_template, jsonify

app = Flask(__name__, static_folder='static', template_folder='.')


@app.route('/')
def homepage():
    '''Displays the homepage.'''
    return render_template('index.html')


if __name__ == '__main__':
    app.debug = True
    app.run()
