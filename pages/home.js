import React, { Component } from 'react';
import { Chart, Progress, Card, CardBody, Row, Col, Loader } from '@nio/ui-kit';
import PieChart from 'react-minimal-pie-chart';
import lightness from 'lightness';
import { withPubkeeper } from '../providers/pubkeeper';

function add(accumulator, a) {
  return accumulator + a;
}

class Page extends Component {
  state = {
    state: '',
    image: '',
    predictions: [],
    tally: {},
    timestamp: '',
    history: [],
    pieChartSpecies: '',
    pieChartData: [],
  };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron('birds', (patron) => {
      patron.on('message', this.writeDataToState);
      return () => {
        // deactivation/tear-down
        patron.off('message', this.writeDataToState);
      };
    });
    pkClient.addPatron('stats', (patron) => {
      patron.on('message', this.writeHistoryToState);
      return () => {
        // deactivation/tear-down
        patron.off('message', this.writeHistoryToState);
      };
    });
  };

  writeDataToState = (rawData) => {
    const newState = this.parseData(rawData);
    newState.timestamp = this.getTime(newState.timestamp);
    if (newState.tally) {
      newState.pieChartData = [];
      const sortedTally = this.sortTally(newState.tally);
      sortedTally.forEach((v, k) => newState.pieChartData.push({ title: `${/\(([^)]+)\)/.exec(k)[1]} - ${v} sightings`, value: v, color: lightness('#3cafda', (Math.floor(Math.random() * 22) + 1)) }));
    }
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

  getTime = timestamp => new Date(timestamp).toLocaleString('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  speciesName = (rawName) => {
    const openParen = rawName.lastIndexOf('(');
    const closeParen = rawName.lastIndexOf(')');
    const commonName = rawName.slice(openParen + 1, closeParen);
    const latinName = rawName.slice(0, openParen - 1);
    return { commonName, latinName };
  };

  sortTally = (tally) => {
    const mappedTally = new Map(Object.entries(tally));
    const topValues = new Map([...mappedTally.entries()].sort((a, b) => b[1] - a[1]));
    return topValues;
  };

  percentScore = score => Math.trunc(score * 1000) / 10;

  setPieChartLabel = (e) => {
    const pieChartSpecies = e.currentTarget.getElementsByTagName('title')[0].textContent;
    this.setState({ pieChartSpecies });
  };

  clearPieChartLabel = () => this.setState({ pieChartSpecies: '' });

  render = () => {
    const { state, image, predictions, timestamp, history, pieChartSpecies, pieChartData } = this.state;
    const { commonName, latinName } = this.speciesName(state);

    return (
      <>
        <Row>
          <Col md="6">
            <Card className="mb-4 overflow-hidden topRow">
              <CardBody className="p-0 overflow-hidden image-holder">
                {image ? (
                  <img
                    alt="this is my birdfeeder. there are many like it, but this one is mine."
                    src={`data:image/jpeg;base64,${image}`}
                    height="430"
                  />
                ) : (
                  <Loader />
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md="6">
            <Card className="mb-4 topRow">
              <CardBody>
                {predictions ? (
                  <>
                    <h2>{commonName || '...'}</h2>
                    <h5><i>{latinName || '...'}</i></h5>
                    Sighted: {timestamp || '...'}
                    <hr />
                    {predictions.map(p => (
                      <Row key={p.label} className="mb-3">
                        <Col>
                          <Progress value={this.percentScore(p.score)} />
                          {this.speciesName(p.label).commonName}: {this.percentScore(p.score)}%
                        </Col>
                      </Row>
                    ))}
                  </>
                ) : (
                  <Loader />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="9">
            <Card className="mb-4 bottomRow">
              <CardBody className="p-1">
                {history && history.length > 0 ? (
                  <Chart
                    title="Past 72 Hours Activity"
                    type="line"
                    data={{
                      chartType: 'line',
                      datasets: [{ values: history }],
                      labels: Array(history.length).fill(''),
                    }}
                    lineOptions={{
                      heatline: 1,
                      hideDots: 1,
                      regionFill: 1,
                    }}
                    axisOptions={{
                      xAxisMode: 'tick',
                    }}
                  />
                ) : (
                  <Loader />
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="mb-4 bottomRow">
              <CardBody className="px-3 py-2">
                <div className="mb-3">Species Distribution (Today)</div>
                {pieChartData && pieChartData.length ? (
                  <PieChart
                    style={{ height: '170px', margin: '0 auto' }}
                    data={pieChartData}
                    animate
                    onMouseOut={this.clearPieChartLabel}
                    onMouseOver={this.setPieChartLabel}
                    onFocus={this.setPieChartLabel}
                    label
                    labelStyle={{
                      fontSize: '5px',
                      fill: '#fff'
                    }}
                  />
                ) : (
                  <Loader />
                )}
                <div className="mb-3 piechart-legend">{pieChartSpecies}</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  };
}

export default withPubkeeper(Page);
