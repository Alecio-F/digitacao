import { textodigitacao } from './typing.mjs';
import { config } from './config.mjs';
import { dicas } from './script.mjs';

$(document).ready(function(){
    config();
    textodigitacao();
    dicas();
})