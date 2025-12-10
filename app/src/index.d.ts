declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.tif';
declare module '*.tiff';
declare module '*.png';
declare module '*.webp';
declare module '*.bmp';
declare module '*.ico';
declare module "*.svg"; {
    import React from "react";
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
}