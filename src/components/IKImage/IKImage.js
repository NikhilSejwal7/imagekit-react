import React from 'react';
import ImageKitComponent from "../ImageKitComponent/ImageKitComponent";
import extractImageKitProps from '../../util/extractImageKitProps';

class IKImage extends ImageKitComponent {
  constructor(props, context) {
    super(props, context);
    this.imageRef = React.createRef();
    this.state = {};

    let state = { url: undefined };
    this.state = Object.assign(state, this.prepareState(props, context));
  }

  prepareState(props = this.props, context = this.getContext()) {
    let extendedProps = ImageKitComponent.normalizeOptions(context, props);
    let url = this.getUrl(extendedProps);

    let state = {};

    let currentState = this.state || {};

    if (url !== currentState.url) {
      state.url = url;
    }

    if(props.alt){
      state.alt = props.alt;
    }else{
      state.alt="";
    }

    return state;
  }

  lqipload(quality, blur) {
    let url = this.state.url;
    let lqip = "";
    if (this.props.path !== undefined) {
      let newUrl = url.split("tr:");
      if (newUrl[0] === url) {
        let newUrl = url.split("/");
        newUrl = `${newUrl[0]}//${newUrl[2]}/${newUrl[3]}/tr:q-${quality},b-${blur}/${newUrl[4]}`;
        lqip = `${newUrl}`;
      } else {
        newUrl = `${newUrl[0]}tr:q-${quality},b-${blur},${newUrl[1]}`;
        lqip = `${newUrl}`;
      }
    } else {
      if(url.includes("tr")){
        lqip = `${url}&q-${quality},b-${blur}`;
      }
      else {
        lqip = `${url}&tr=q-${quality},b-${blur}`;
      }

    }
    return lqip;
  }

  getFinalImageSrcURL(loading, lqip){

    /*
    No lazy loading no lqip
      src=originalImage
    No lazy loading lqip
      src=lqip
      src=originalImage (when loaded)
    lazy loading and no lqip
      src=''
      onIntersect:
      src=originalImage
    lazy loading and lqip
      src=lqip
      onInterserct:
      src=originalImage (when loaded)
   */

    const {
      originalSrcLoaded,
      intersected,
    } = this.imageRef.current;

    const {
      url
    } = this.state;

    if (loading !== "lazy" && lqip === null) {
      return imageAttrs.src;
    } else if (loading !== "lazy" && this.lqip && this.lqip.active) {
      if (originalSrcLoaded) {
        return url;
      } else {
        return lqipload(lqip.quality, lqip.blur);
      }
    } else if (this.loading === "lazy" && this.lqip === null) {
      if (this.intersected) {
        return url;
      } else {
        return "";
      }
    } else if (this.loading === "lazy" && this.lqip && this.lqip.active) {
      if (intersected && originalSrcLoaded) {
        return url;
      } else {
        return lqipload(lqip.quality, lqip.blur);
      }
    }
  }

  componentDidMount() {
    const imageObserver = new IntersectionObserver(function (entry, observer) {
      if (entry[0].isIntersecting) {
        let image = entry[0].target;
        image.src = url;
        imageObserver.unobserve(image);
      }
    });

    const image = this.imageRef.current;
    let url = this.state.url;
    if (!image) return

    imageObserver.observe(image);

  }

  componentDidUpdate() {
    this.setState(this.prepareState());
  }

  render() {
    let { url, alt } = this.state;
    const props = { ...this.props };
    const { nonImageKitProps } = extractImageKitProps(props);
    const { lqip, loading } = props;
    const url = getfinalImageSrcURL(loading, lqip);
    
    return < img src={url} {...nonImageKitProps} ref={this.imageRef} alt={alt} />;
  }
}

IKImage.propTypes = ImageKitComponent.propTypes;

export default IKImage;
