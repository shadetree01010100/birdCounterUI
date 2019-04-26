import React, { Component } from "react";
import { Chart, Loader, Progress } from '@nio/ui-kit';
import { withPubkeeper } from "../providers/pubkeeper";

function add(accumulator, a) {
    return accumulator + a;
}

class Page extends Component {
  state = {
      state: "",
      image: "",
      predictions: [],
      tally: {},
      timestamp: "",
      history: [],
      cumulative_count: 0
  };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron("birds", patron => {
      patron.on("message", this.writeDataToState);
      return () => {
        // deactivation/tear-down
        patron.off("message", this.writeDataToState);
      };
    });
    pkClient.addPatron("stats", patron => {
      patron.on("message", this.writeHistoryToState);
      return () => {
        // deactivation/tear-down
        patron.off("message", this.writeHistoryToState);
      };
    });
  };

  writeDataToState = (rawData) => {
    const newState = this.parseData(rawData);
    newState.timestamp = this.getTime(newState.timestamp);
    this.setState(newState);
  };

  writeHistoryToState = (rawData) => {
      const newState = this.parseData(rawData);
      this.setState(newState);
    };

  parseData = (rawData) => {
    const rawJson = new TextDecoder().decode(rawData);
    const json = JSON.parse(rawJson);
    const parsedJson = json[json.length - 1];
    return parsedJson;
  };

  getTime = (timestamp) => {
    var localTime = new Date(timestamp);
    var localTime = localTime.toLocaleString(
      "en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      }
    );
    return localTime;
  };

  speciesName = (rawName) => {
    const openParen = rawName.lastIndexOf("(");
    const closeParen = rawName.lastIndexOf(")");
    const commonName = rawName.slice(openParen + 1, closeParen);
    const latinName = rawName.slice(0, openParen - 1);
    return {
      "commonName": commonName,
      "latinName": latinName
    };
  };

  sortTally = (tally) => {
    const mappedTally = new Map(Object.entries(tally));
    const topValues = new Map([...mappedTally.entries()].sort((a, b) => b[1] - a[1]));
    return topValues;
  };

  truncateTally = (tally) => {
    const keys = Array.from(tally.keys());
    const values = Array.from(tally.values());
    const remainder = values.splice(5);
    keys.splice(5);
    keys.push("Other");
    const remainderSum = remainder.reduce(add);
    values.push(remainderSum);
    return keys, values;
  };

  percentScore = (score) => {
    return Math.trunc(score * 1000) / 10;
  };

  render() {
    const { state, image, predictions, tally, timestamp, history, cumulative_count } = this.state;
    const { commonName, latinName } = this.speciesName(state);
    // const today = this.sortTally(tally);
    // const [ todayLabels, todayValues ] = this.truncateTally(today);
    const todayLabels = Object.keys(tally);
    const todayValues = Object.values(tally);
    const colors = new Array(history.length).fill("#6EE1FF");
    history.push(cumulative_count);
    colors.push("#87F7C1");
    console.log(history);
    console.log(colors);

    return (
      <center>
        <table cellSpacing="10" border="0"  width="100%">
          <tbody>
            <tr valign="top">
              <td width="50%" rowSpan="6">
                <img src={ `data:image/jpeg;base64,${image}` } width="100%" />
              </td>
              <td>
                <h1>{ commonName }</h1>
                <h4><i>{ latinName }</i></h4>
                <b>Sighted: { timestamp }</b>
              </td>
            </tr>
            {predictions && predictions.map(p => (
              <tr key={p.label}>
                <td>
                  <Progress value={this.percentScore(p.score)} />
                  <b><a href={ `https://www.google.com/search?q=${ this.speciesName(p.label).latinName.replace(" ", "+") }&tbm=isch` } target="_blank">{ this.speciesName(p.label).commonName }</a>: { this.percentScore(p.score) }%</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <table cellSpacing="10" border="0" width="100%" height="50%">
          <tbody>
            <tr valign="top">
              <td>
                <Chart
                    title="Past 72 Hours Activity"
                    type="bar"
                    data={{
                        "datasets":[
                          {"values": history}
                        ],
                        "labels": Array(history.length).fill("")
                    }}
                    colors={ colors }
                  />
              </td>
              <td width="25%">
                <Chart
                  title="Species Distribution (Today)"
                  type="pie"
                  data={{
                    "datasets": [
                      {
                        "chartType": "line",
                        "values": todayValues
                      }
                    ],
                    "labels": todayLabels,
                  }}
                  options={{
                    "legend": {"display": false}
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <br />
      </center>
    );
  };
};

export default withPubkeeper(Page);
