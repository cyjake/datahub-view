import React, {
  Component,
} from 'react';

import {
  Icon,
  Input,
  Button,
  Tooltip,
  Popconfirm,
} from 'antd';

import {
  Row,
  Col,
} from 'react-flexbox-grid';

import {
  injectIntl,
  FormattedMessage,
} from 'react-intl';

import SceneForm from '../forms/SceneForm';
import { sceneService } from '../../service';

const Search = Input.Search;

class InterfaceSceneList extends Component {
  state = {
    sceneFormVisible: false,
    sceneFormLoading: false,
    filterString: '',
    stageData: null,
  }

  formatMessage = id => this.props.intl.formatMessage({ id })

  showSceneForm = () => {
    this.setState({
      formType: 'create',
      stageData: null,
      sceneFormVisible: true,
    });
  }

  showUpdateForm = async value => {
    this.setState({
      formType: 'update',
      stageData: value,
      sceneFormVisible: true,
    });
  }

  hideSceneForm = () => {
    this.setState({
      sceneFormVisible: false,
    });
  }

  confirmSceneForm = async ({ sceneName, contextConfig, data }) => {
    const { uniqId: interfaceUniqId } = this.props.interfaceData;
    this.setState({
      sceneFormLoading: true,
    });
    const apiName = this.state.stageData
      ? 'updateScene'
      : 'createScene';

    const res = await sceneService[apiName]({
      uniqId: this.state.stageData && this.state.stageData.uniqId,
      interfaceUniqId,
      sceneName,
      contextConfig,
      data,
    });
    this.setState({
      sceneFormLoading: false,
    });
    if (res.success) {
      this.setState({
        sceneFormVisible: false,
      }, this.postCreate);
    }
  }

  postCreate = async value => {
    await this.props.updateInterFaceAndScene();
  }

  filterScene = (e) => {
    const filter = e.target.value.toLowerCase();
    this.setState({
      filterString: filter,
    });
  }

  defaultColProps = {
    xs: 12,
    sm: 12,
    md: 6,
    lg: 3,
  }

  renderSceneList = () => {
    const formatMessage = this.formatMessage;
    const { sceneList, selectedScene } = this.props;
    const disabled = this.props.disabled;
    return (
      <Row>
        {
          sceneList.filter(value => {
            return value.sceneName.toLowerCase().includes(this.state.filterString);
          }).map((value, index) => {
            const isAvtive = selectedScene.uniqId === value.uniqId;
            const classNames = isAvtive ? [
              'common-list-item',
              'common-list-item-active',
            ] : [ 'common-list-item' ];
            if (disabled) classNames.push('disabled');
            return <Col
              {...this.defaultColProps}
              key={value.uniqId}
              data-accessbilityid={`project-api-scene-list-${index}`}
              disabled={this.props.disabled}
            >
              <div className={classNames.join(' ')}>
                <div className="common-list-item-name"
                  title={`${formatMessage('sceneList.sceneName')} ${value.sceneName}`}
                  onClick={() => !disabled && this.props.changeSelectedScene(value)}
                >
                  {value.sceneName}
                </div>
                {
                  !disabled && <div className="common-list-item-operation">
                    <Tooltip title={formatMessage('sceneList.updateScene')}>
                      <Icon type="edit"
                        onClick={() => this.showUpdateForm(value)}
                      />
                    </Tooltip>
                    <Tooltip title={this.formatMessage('sceneList.deleteScene')}>
                      <Popconfirm
                        placement="right"
                        title={formatMessage('common.deleteTip')}
                        onConfirm={() => this.props.deleteScene(value)}
                        okText={formatMessage('common.confirm')}
                        cancelText={formatMessage('common.cancel')}
                      >
                        <Icon type="delete"/>
                      </Popconfirm>
                    </Tooltip>
                  </div>
                }
              </div>
            </Col>;
          })
        }
      </Row>
    );
  }

  render () {
    const formatMessage = this.formatMessage;
    const disabled = this.props.disabled;
    const selectedScene = this.props.selectedScene;
    const contextConfig = selectedScene && selectedScene.contextConfig;

    let showResInfo = false;
    if (contextConfig) {
      const {
        responseDelay,
        responseStatus,
        responseHeaders,
      } = contextConfig;
      showResInfo = responseDelay && responseDelay.toString() !== '0' || responseStatus && responseStatus.toString() !== '200' || responseHeaders && JSON.stringify(responseHeaders) !== '{}';
    }

    return (
      <section>
        <h1><FormattedMessage id='sceneList.title' /></h1>
        {
          ['GET', 'ALL'].includes(this.props.interfaceData.method)
            ? <a href={this.props.previewLink} target="_blank">{formatMessage('interfaceDetail.previewData')}{`/${window.context.projectName}/${this.props.interfaceData.pathname}`}</a>
            : ''
        }

        {contextConfig && showResInfo
          ? <div>
            <div className="res-header-info">
              <span>{formatMessage('sceneList.responseDelayShowInfo')}：</span>
              <span>{contextConfig.responseDelay}s</span>
            </div>
            <div className="res-header-info">
              <span>{formatMessage('sceneList.responseStatusShowInfo')}：</span>
              <span>{contextConfig.responseStatus}</span>
            </div>
            <div className="res-header-info">
              <span>{formatMessage('sceneList.responseDataShowInfo')}：</span>
              <span>{JSON.stringify(contextConfig.responseHeaders)}</span>
            </div>
          </div>
          : ''}

        <Row style={{padding: '4px 0'}}>
          <Col {...this.defaultColProps}>
            <Search
              disabled={disabled}
              placeholder={formatMessage('sceneList.searchScene')}
              onChange={this.filterScene}
            />
          </Col>
          <Col {...this.defaultColProps}>
            <Button
              disabled={disabled}
              type="primary"
              data-accessbilityid="project-api-scene-add-btn"
              onClick={this.showSceneForm}
            >
              <Icon type="plus-circle-o" />
              {formatMessage('sceneList.createScene')}
            </Button>
          </Col>
        </Row>

        <div>
          { disabled
            ? <FormattedMessage id='sceneList.switchSceneDisabledHint'/>
            : <FormattedMessage id='sceneList.switchSceneHint'/> }
        </div>
        { this.renderSceneList() }

        <SceneForm
          visible={this.state.sceneFormVisible}
          onCancel={this.hideSceneForm}
          onOk={this.confirmSceneForm}
          confirmLoading={this.state.sceneFormLoading}
          stageData={this.state.stageData}
        />
      </section>
    );
  }
}

export default injectIntl(InterfaceSceneList);
