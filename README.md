```
███    ███ ██ ███   ██ ██ ██████ █████ ██  ██  ████  ██████
██ ████ ██ ██ ██ ██ ██ ██   ██   ██    ██████ ██████   ██  
██  ██  ██ ██ ██  ████ ██   ██   █████ ██  ██ ██  ██   ██  
``` 

_A super simple cool chat in NodeJs_

### Features : 
- Display last messages 
- Highlight links automatically
- System notifications 
- Double click to quote
- Kaomojis (*-*) 
- Page displaying all links posted on the minitchat
- Remove vowels from nickname

---

Logo made by (b‿g) 

---

### Installation :   
**You need NodeJs & MongoDB**   
_Example for raspberry pi :_    
Install NodeJs :    
`curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -` 

Install MongoDB :   
``` 
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```
Clone this repo, then the classic : 
`npm install`

And start it : 
`npm run minitchat`


### Screenshot :
![image](https://user-images.githubusercontent.com/56537238/151720109-36a0fca6-2541-496a-90a4-7f622e8e8142.png)
