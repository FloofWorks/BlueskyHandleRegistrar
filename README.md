# Bluesky Handle Registrar
---
### What is this?
This is a collection of NodeJS Applications that Allow you to host a web-form, which people can fill out to register a bluesky handle on your domain.


### How does it work?
When Bluesky Verifies any given handle, it uses one of two methods to verify.

#### DNS Record
In this example, we want to verify the handle "furo.lucario.social". Our Domain is "lucario.social" and our handle is "furo", 
so Bluesky Checks for a TXT Record at "_atproto.furo.lucario.social" which should return a DID value, that points to a users account. If the request is successful
and the DNS Record exists, your handle is verified! :D But this is not the Verification method we are interested in!

#### Text File
An alternative to the DNS Record check, is a simple web-request! Let's keep our example handle of "furo.lucairo.social", and say that the DNS Record Check failed, what does bluesky now?
It sends a API-Request to "https://furo.lucario.social/.well-known/atproto-did", and expects a given DID to be returned. At it's simplest, the code for this would look like this:
```js
app.get('/.well-known/atproto-did', (req, res) => {
  res.status(200).send("did:plc:theDIDgoesHere");
}
```

But You want to let people register their own handles and use your domain for that! How could that work?
The answer? Databases!









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


[Link Text](https://example.com)


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


