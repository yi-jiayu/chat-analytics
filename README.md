# chat-analytics
Data visualisation for WhatsApp conversations

## Usage
Go to https://yi-jiayu.github.io/chat-analytics and select a text file exported from WhatsApp
through the "Email Conversation" option to analyse and visualise the conversation.

## Supported visualisations

### Punch card
![Punch card example](http://yi-jiayu.github.io/chat-analytics/media/punch-card.png)
Just like the Punch Card repository graph on GitHub, the punch card view shows the frequency
of messages sent in a conversation based on day of week and time of day, with the number of
messages sent represented by bubble size.
https://yi-jiayu.github.io/chat-analytics/

### Message frequency (EXPERIMENTAL)
Plots the number of messages sent by each participant in a chat each day on a line chart.
https://yi-jiayu.github.io/chat-analytics/line-chart-test/index.html

## Data Policy
All data is processed and rendered in the browser. No data is sent to any server.

## Development
To install:
```bash
cd <project-folder>
npm install
```

To run development server:
```bash
node server.js
```
Then choose browser of choice.
URL to open should be `http://127.0.0.1:8181`.
