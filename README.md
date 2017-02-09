# Development guide

## Install Nodejs 0.12.X

    sudo apt-get install npm
    sudo npm install -g npm
    sudo npm cache clean -f
    sudo npm install -g n
    sudo n 0.12.4


## To develop on local server:

- Open the `webpack.config.js` and you could see something about `api_base_url`.

As a result, we have to set `API_BASE_URL` on the line 37 as `https://poolteam.apps.exosite.io` - our solution url.

i.e. : 
    
    API_BASE_URL: JSON.stringify('https://poolteam.apps.exosite.io'),

- Open the `http://localhost:8080` and it should work.

 

    
    
    