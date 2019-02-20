import React, { Component } from 'react';
import { Button, Chart, CircularProgressBar, Loader } from '@nio/ui-kit';
import { withPubkeeper } from '../providers/pubkeeper';

class Page extends Component {
  state = { rand_num: 0, state_color: '', history: false };

  componentDidMount = () => {
    const { pkClient } = this.props;
    pkClient.addPatron('rand_num', patron => { 
      patron.on('message', this.writeDataToState);
      return () => {
        // deactivation/tear-down
        patron.off("message", this.writeDataToState);
      };
    } );
    pkClient.addBrewer('button', brewer => {
        this.brewer = brewer;
        return () => null;  
    } );
  };

  writeDataToState = (data) => {
    const json = new TextDecoder().decode(data);
    const { rand_num, state_color, history } = Array.isArray(JSON.parse(json)) ? JSON.parse(json)[0] : JSON.parse(json);
    this.setState({ rand_num, state_color, history });
  };

  brewCurrentTimestamp = () => {
    this.brewer.brewJSON([{ timestamp: new Date() }]);
  };

  render() {
    const { rand_num, state_color, history } = this.state;
    console.log(this.state.history);
    return (
      <center>
      <table cellspacing="10">
      <tbody>
      <tr valign='top'>
      <td width='25%'>
      <CircularProgressBar percentage={rand_num} color={state_color} />
      </td>
      <td rowSpan='2' className='chartcell'>
      {history ? ( <Chart
        title='Historical Values'
        type='line'
        data={
            {'labels':['','','','','','','','','',''], 'datasets':[{'values': history}]}}
      /> ) : ( <Loader /> )}
      </td>
      </tr>
      <tr>
      <td>
      <Button block color="primary" onClick={() => this.brewCurrentTimestamp()}>random number!</Button>
      </td>
      </tr>
      </tbody>
      </table>
      </center>
    );
  }
}

export default withPubkeeper(Page);