# chat-analytics
Data visualisation for WhatsApp conversations

## Usage
Go to https://yi-jiayu.github.io/chat-analytics and select a text file exported from WhatsApp
through the "Email Conversation" option to analyse and visualise the conversation.

## Supported visualisations
### Punch card
Just like the Punch Card repository graph on GitHub, the punch card view shows the frequency
of messages sent in a conversation based on day of week and time of day, with the number of
messages sent represented by bubble size.

## Data Policy
All data is processed and rendered in the browser. No data is sent to any server.

## Development
To install:
```bash
cd <project-folder>
npm install
```

To run developement server:
```bash
node server.js
```
Then choose browser of choice.
URL to open should be `http://127.0.0.1:8181`.