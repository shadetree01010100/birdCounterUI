import React, { Component } from "react";
import { Chart, Progress } from '@nio/ui-kit';
import { withPubkeeper } from "../providers/pubkeeper";

class Page extends Component {
  state = { state: "", image: "", predictions: [], tally: {}, timestamp: "" };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron("birds.capture", patron => { 
      patron.on("message", this.writeDataToState);
      return () => {
        // deactivation/tear-down
        patron.off("message", this.writeDataToState);
      };
    });
    pkClient.addPatron("birds.tally", patron => { 
      patron.on("message", this.writeDataToState);
      return () => {
        // deactivation/tear-down
        patron.off("message", this.writeDataToState);
      };
    });
  };

  writeDataToState = (rawData) => {
    const newState = this.parseData(rawData);
    this.setState(newState);
  };

  parseData = (rawData) => {
    const rawJson = new TextDecoder().decode(rawData);
    const json = JSON.parse(rawJson);
    const parsedJson = json[json.length-1]
    parsedJson.timestamp = this.getTime(parsedJson.timestamp);
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

  percentScore = (score) => {
    return Math.trunc(score * 1000) / 10;
  };

  render() {
    const { state, image, predictions, tally, timestamp } = this.state;
    const { commonName, latinName } = this.speciesName(state);
    return (
      <center>
        <table cellSpacing="10" border="1"  width="100%">
          <tbody>
            <tr valign="top">
              <td width="50%" rowSpan="6">
                <img src={ `data:image/jpeg;base64,${image}` } width="100%" />
              </td>
              <td>
                <h2>{ commonName }</h2>
                <h5><i>{ latinName }</i></h5>
                Sighted: { timestamp }
                <hr className="dashed" /> 
              </td>
            </tr>
            {predictions && predictions.map(p => (
              <tr key={p.label}>
                <td>
                  <Progress value={this.percentScore(p.score)} />
                  {
                    this.speciesName(p.label).commonName
                  }: {
                    this.percentScore(p.score)
                  }%
                </td>
              </tr> 
            ))}
          </tbody>
        </table>
        <br />
        <table cellSpacing="10" border="1" width="100%">
          <tbody>
            <tr>
              <td>
                <Chart type="pie" data={{
                  "datasets": [
                    {
                      "name": "dem birbs",
                      "chartType": "line",
                      "values": Object.values(tally)
                    }
                  ],
                  "labels": Object.keys(tally)
                }}/>
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
