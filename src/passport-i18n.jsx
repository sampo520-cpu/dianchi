import React, {createContext,useContext} from 'react';
import i18next from 'i18next';
import {useTranslation,initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {passportLanguages,passportResources} from './passport-locales.js';

export const passportI18n=i18next.createInstance();
passportI18n.use(LanguageDetector).use(initReactI18next).init({resources:passportResources,fallbackLng:'en',supportedLngs:Object.keys(passportLanguages),load:'languageOnly',keySeparator:false,nsSeparator:false,initImmediate:false,interpolation:{escapeValue:false},detection:{order:['querystring','localStorage','navigator'],lookupQuerystring:'lang',lookupLocalStorage:'passport-language',caches:[]},react:{useSuspense:false}});
export const PassportLocale=createContext('en');
export function PassportText({children}) {
  const language=useContext(PassportLocale);
  const {t}=useTranslation('translation',{i18n:passportI18n,lng:language,useSuspense:false});
  const visit=node=>{
    if(typeof node==='string') {const trimmed=node.trim();return trimmed&&passportI18n.exists(trimmed,{lng:language})?node.replace(trimmed,t(trimmed)):node;}
    if(Array.isArray(node))return React.Children.map(node,visit);
    if(!React.isValidElement(node))return node;
    if(node.props.translate==='no')return node;
    const props={};
    if(typeof node.type==='string') for(const key of ['title','placeholder','aria-label']) if(typeof node.props[key]==='string'&&passportI18n.exists(node.props[key],{lng:language}))props[key]=t(node.props[key]);
    return node.props.children===undefined?React.cloneElement(node,props):React.cloneElement(node,props,visit(node.props.children));
  };
  return visit(children);
}
