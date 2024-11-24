# Bluesky Handle Registrar
---
### What is this?
This is a collection of NodeJS Applications that Allow you to host a web-form, which people can fill out to register a bluesky handle on your domain.
This also allows users to customize where `https://handle.domain.com` redirects, either a Custom URL or Their Bluesky Profile. <br>
<br>
<br>
### How does it work?
When Bluesky Verifies any given handle, it uses one of two methods to verify.
<br>
#### DNS Record
In this example, we want to verify the handle "furo.lucario.social". Our Domain is "lucario.social" and our handle is "furo", 
so Bluesky Checks for a TXT Record at "_atproto.furo.lucario.social" which should return a DID value, that points to a users account. If the request is successful
and the DNS Record exists, your handle is verified! :D But this is not the Verification method we are interested in!
<br>
#### Text File
An alternative to the DNS Record check, is a simple web-request! Let's keep our example handle of "furo.lucairo.social", and say that the DNS Record Check failed, what does bluesky now?
It sends a API-Request to `https://furo.lucario.social/.well-known/atproto-did`, and expects a given DID to be returned. At it's simplest, the code for this would look like this:
```js
app.get('/.well-known/atproto-did', (req, res) => {
  res.status(200).send("did:plc:theDIDgoesHere");
}
```
<br>
But You want to let people register their own handles and use your domain for that! How could that work?
The answer? Databases!
<br>
<br>
### Backend (scary)
Inside the backend, we have a couple of endpoints, but most importantly these:
- / (root)
```markdown
The Root Path is used to redirect people to the their handle redirection target URL, or simply their bluesky Profile
```
- /handle
```markdown
This serves the Form to Register a handle
```
- /redirect
```markdown
This serves a form to Setup where the https://handle.domain.com URL redirects.
```
- /debug
```markdown
This serves a Debug Page to View Registrants' data and modify it.
```
- /api/register
```markdown
API Endpoint To Register
```
- /.well-known/atproto-did
```markdown
Bluesky Endpoint that serves a given handle's DID value
```
- /api/public/registrants
```markdown
API Endpoint that serves all registrants that have been verified.
```
- /api/getDataByUser/:username
```markdown
API Endpoint that serves all users Handles that match the username.
```
- /api/getDataByDid/:did
```markdown
API Endpoint that serves all users that match the DID.
```
- /api/getDataByDomain/:domain
```markdown
API Endpoint that serves all users' data that match the given domain.
```
- /api/getDataByHandle/:handle
```markdown
API Endpoint that returns a user that matches the handle.
```
<br>
<br>
### Registering
When a user Registers a handle, they have to input their desired handle, an E-Mail, and their Bluesky Account DID. The server has a string array for "Pure" and "Reserved" Handles.<br>
<br>
#### Pure Handles
A Pure handle is any handle where the handle reflects a popular object's name, or a dictionary word, such as "Lucario" or "Tree". <br>
These handles require manual Verification by you, something you can do via the /debug endpoint.<br>
<br>
#### Reserved Handles
Do you have friends? Surely you'd like to reserve them some handles! To make sure nobody registers with a handle that should belong to your friend, <br>
the server refuses to let people register a reserved handle.<br>
<br>
#### How does Verification Work?
Internally, every user has a State. <br>
```markdown
V = Verified
NV = Not Verified
V_F = Verified Pure Handle
VR = Verification Rejected
VR_F = Pure Handle Verification Rejected
PENDING = For Debug Purposes
```
When a user registers a Non-Pure handle, their handle's state is automatically set to "V".<br>
When a user registers a Pure Handle, their handle's state is set to NV.<br>
<br>
The server ONLY Responds to any endpoint requests with users that are either in the state "V" or "V_F".<br>
To manually Verify a User, Open the /debug endpoint, find your target user, <br>
and Click the Pen Icon and Change their state to "V_F".<br>
<br>
<br>
<br>
### What about Redirects?
Redirects are a neat Feature! Since They technically register the subdomain from you, <br>
you can let them customize where `https://theirHandle.YourDomain.com` redirects!<br>
That's what the /redirect endpoint is for!<br>

When Setting up a Redirection, you must run the nodeJS application inside /BlueskyDMer/index.mjs!<br>
This nodeJS application is not public, <br>
and it's purpose is to DM Users their Unique 6 digit code to verify that THEY want to change the handle.<br>
<br>
<br>
## Requirements
- You NEED to have a Wildcard SSL Certificate!!!!
- NodeJS 20.12.1
- NPM
<br>
And These Node Packages on both NodeJS Apps:
- express
- path
- cookie-parser
- sqlite3
- axios
- util
- dotenv
- axios
- url
- @skyware/bot
<br>
To install Node Packages, simply run `npm install <package name>`.<br>
To Get a Wildcard SSL Certificate, follow [this](https://certbot.eff.org/) guide!<br>
To Purchase a domain, you can find domains for sale [Here](https://www.godaddy.com)!<br>
To point the port 80 to your NodeJS Application Port, follow [this](https://medium.com/@adarsh-d/node-js-on-port-80-or-443-7083336af3b0) guide!<br>
<br>
<br>
## Installation
How do you install? Good question!
1. [Download The Latest Release]([https://example.com](https://github.com/FloofWorks/BlueskyHandleRegistrar/releases))
2. Extract Into Any Folder on your Server
3. Open The Root Folder
4. Open index.mjs
   1. Edit the "BACKEND_PASSWORD" value to a very strong password!
   2. Edit the "secretKey" value to your Google Captcha Secret Key
   3. Edit the "reservedUsernames" to set up some Pure Handles.
   4. Edit the "reservedH" array to set up some Reserved Handles.
5. Open The "BlueskyDMer" folder
6. Open index.mjs
   1. Edit the "secretKey" value to your Google Captcha Secret Key
   2. Update the Cridentials to your Auht Bot
   3. Update the botDID value to be the DID of your Auth Bot
   4. Inside the "/api/StoreUserSecret/" endpoint, update the Authorisation Header sent to reflect your "BACKEND_PASSWORD".
7. Now run index.mjs inside the root folder and inside the "BlueskyDMer" folder!
8. You're all set up! visit http://localhost:62008/handle to view your Form

### Edit the Frontend
The frontend's files are located inside /public/server
BE CAREFUL! the /public/server/scripts and /styles are public folders, and any files inside them can be requested at all times.
<br>
<br>
<br>
This is my very first ever GitHub project! Please Give me feedback! :D
<!--
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6


**Bold Text**  
*Italic Text*  
_Italic Text_  
***Bold and Italic Text***


[Download The Latest Release]([https://example.com](https://github.com/FloofWorks/BlueskyHandleRegistrar/releases))


- Item 1
  - Sub-item 1.1
  - Sub-item 1.2
- Item 2


1. Item 1
   1. Sub-item 1.1
   2. Sub-item 1.2
2. Item 2


![Alt Text](https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:uok63s7mouxwiulxabk6olmi/bafkreieabawy5jmkjs4wb2p5uzjgslzqs4dszkdoi6zratpjsdk4hlpg6m@jpeg)


`Inline code example`


```bash
# Example of a Bash command
npm install


```
#### Generic Code Block
```markdown
npm install sex
```


> This is a blockquote.
> It can span multiple lines.


| Column 1   | Column 2   |
|------------|------------|
| Data Row 1 | Data Row 2 |
| Data Row 3 | Data Row 4 |


---


🚀 :rocket:
🌟 :star:
📫 :mailbox_with_mail:


- [x] Completed Task
- [ ] Incomplete Task

[![Badge Text](https://img.shields.io/badge/Example-Badge-blue)](https://example.com)
[![Badge Text](https://img.shields.io/badge/Example-Badge-blue)](https://example.com)


## Table of Contents
1. [Section 1](#section-1)
2. [Section 2](#section-2)


<!-- This is a comment -->


