/**
 * Banco de palavras do modo "Palavras Aleatórias".
 * Palavras simples em português, minúsculas, sem hífen, sem pontuação e
 * majoritariamente sem acento (há uma lista acentuada separada para uso futuro
 * via includeAccents). Sem termos ofensivos ou sensíveis.
 */

export const commonWords = [
  'casa', 'tempo', 'vida', 'mundo', 'pessoa', 'gente', 'coisa', 'parte', 'lugar', 'forma',
  'modo', 'caso', 'ponto', 'grupo', 'nome', 'palavra', 'ordem', 'fato', 'valor', 'ideia',
  'razao', 'momento', 'exemplo', 'numero', 'estado', 'nivel', 'tipo', 'meio', 'fim', 'comeco',
  'dia', 'noite', 'tarde', 'manha', 'hora', 'minuto', 'segundo', 'semana', 'ano', 'mes',
  'amigo', 'amiga', 'familia', 'pai', 'mae', 'filho', 'filha', 'irmao', 'irma', 'aluno',
  'aluna', 'colega', 'vizinho', 'turma', 'equipe', 'time', 'povo', 'cidade', 'pais', 'rua',
  'verdade', 'sorte', 'forca', 'paz', 'amor', 'medo', 'sonho', 'plano', 'meta', 'desafio',
  'jogo', 'regra', 'passo', 'etapa', 'fase', 'rodada', 'treino', 'foco', 'ritmo', 'pratica',
  'historia', 'assunto', 'tema', 'detalhe', 'resposta', 'pergunta', 'duvida', 'segredo', 'aviso', 'recado',
  'inicio', 'final', 'centro', 'lado', 'frente', 'fundo', 'topo', 'base', 'borda', 'canto',
  'mesa', 'porta', 'chave', 'caminho', 'ponte', 'linha', 'coluna', 'fila', 'volta', 'curva',
  'agua', 'fogo', 'terra', 'vento', 'luz', 'sombra', 'cor', 'som', 'cheiro', 'gosto',
];

export const objectWords = [
  'livro', 'caderno', 'caneta', 'lapis', 'papel', 'folha', 'borracha', 'regua', 'tesoura', 'cola',
  'mochila', 'estojo', 'quadro', 'giz', 'pincel', 'tinta', 'cartaz', 'mapa', 'globo', 'relogio',
  'cadeira', 'banco', 'sofa', 'cama', 'travesseiro', 'cobertor', 'tapete', 'cortina', 'janela', 'espelho',
  'copo', 'prato', 'garfo', 'faca', 'colher', 'panela', 'xicara', 'jarra', 'bandeja', 'pote',
  'caixa', 'saco', 'bolsa', 'carteira', 'moeda', 'nota', 'cartao', 'bilhete', 'ticket', 'chaveiro',
  'roda', 'pedal', 'motor', 'parafuso', 'prego', 'martelo', 'serra', 'chave', 'fita', 'corda',
  'lampada', 'tomada', 'fio', 'pilha', 'bateria', 'controle', 'botao', 'alavanca', 'painel', 'tela',
  'guarda', 'sombrinha', 'chapeu', 'oculos', 'sapato', 'meia', 'camisa', 'calca', 'blusa', 'casaco',
  'violao', 'tambor', 'flauta', 'apito', 'sino', 'cordao', 'anel', 'pulseira', 'colar', 'brinco',
];

export const actionWords = [
  'andar', 'correr', 'pular', 'saltar', 'subir', 'descer', 'entrar', 'sair', 'voltar', 'chegar',
  'partir', 'parar', 'seguir', 'mover', 'girar', 'rolar', 'cair', 'levantar', 'sentar', 'deitar',
  'falar', 'ouvir', 'olhar', 'ver', 'ler', 'escrever', 'contar', 'cantar', 'dancar', 'tocar',
  'pegar', 'soltar', 'jogar', 'lancar', 'puxar', 'empurrar', 'abrir', 'fechar', 'cortar', 'colar',
  'comer', 'beber', 'cozinhar', 'lavar', 'limpar', 'secar', 'dobrar', 'guardar', 'arrumar', 'organizar',
  'pensar', 'lembrar', 'esquecer', 'aprender', 'ensinar', 'estudar', 'treinar', 'praticar', 'tentar', 'conseguir',
  'comecar', 'terminar', 'criar', 'montar', 'construir', 'desenhar', 'pintar', 'medir', 'pesar', 'somar',
  'mudar', 'trocar', 'ajudar', 'cuidar', 'buscar', 'achar', 'perder', 'ganhar', 'vencer', 'jogar',
  'sonhar', 'crescer', 'evoluir', 'melhorar', 'avancar', 'repetir', 'focar', 'respirar', 'descansar', 'acordar',
  'digitar', 'apertar', 'clicar', 'rolar', 'arrastar', 'salvar', 'enviar', 'receber', 'copiar', 'colar',
];

export const placeWords = [
  'escola', 'colegio', 'faculdade', 'sala', 'biblioteca', 'museu', 'teatro', 'cinema', 'parque', 'praca',
  'mercado', 'feira', 'loja', 'padaria', 'farmacia', 'banco', 'correio', 'hospital', 'clinica', 'estacao',
  'aeroporto', 'porto', 'praia', 'campo', 'floresta', 'montanha', 'rio', 'lago', 'cidade', 'bairro',
  'avenida', 'estrada', 'ponte', 'tunel', 'jardim', 'quintal', 'garagem', 'cozinha', 'quarto', 'banheiro',
  'sotao', 'porao', 'varanda', 'corredor', 'escritorio', 'fabrica', 'oficina', 'ginasio', 'quadra', 'piscina',
  'restaurante', 'lanchonete', 'cafeteria', 'hotel', 'pousada', 'casa', 'apartamento', 'predio', 'castelo', 'fazenda',
  'dojo', 'arena', 'arcade', 'palco', 'arquibancada', 'trilha', 'caverna', 'deserto', 'ilha', 'vale',
];

export const natureWords = [
  'sol', 'lua', 'estrela', 'ceu', 'nuvem', 'chuva', 'neve', 'gelo', 'vento', 'tempestade',
  'arvore', 'flor', 'folha', 'galho', 'raiz', 'semente', 'fruto', 'grama', 'mato', 'bambu',
  'pedra', 'areia', 'barro', 'lama', 'cristal', 'metal', 'madeira', 'carvao', 'ouro', 'prata',
  'mar', 'onda', 'mare', 'corrente', 'cachoeira', 'nascente', 'pantano', 'planicie', 'colina', 'penhasco',
  'verao', 'inverno', 'outono', 'primavera', 'orvalho', 'neblina', 'relampago', 'trovao', 'arco', 'horizonte',
  'rosa', 'cravo', 'girassol', 'margarida', 'lirio', 'cacto', 'palmeira', 'pinheiro', 'cipreste', 'carvalho',
  'lago', 'rio', 'riacho', 'fonte', 'caverna', 'gruta', 'duna', 'pico', 'serra', 'mata',
];

export const technologyWords = [
  'teclado', 'mouse', 'tela', 'monitor', 'computador', 'notebook', 'celular', 'tablet', 'fone', 'caixa',
  'tecla', 'cursor', 'codigo', 'programa', 'aplicativo', 'sistema', 'arquivo', 'pasta', 'documento', 'planilha',
  'rede', 'internet', 'site', 'pagina', 'link', 'menu', 'icone', 'janela', 'aba', 'painel',
  'dados', 'banco', 'tabela', 'grafico', 'relatorio', 'projeto', 'versao', 'modulo', 'funcao', 'variavel',
  'senha', 'usuario', 'conta', 'perfil', 'acesso', 'login', 'cadastro', 'backup', 'download', 'upload',
  'robo', 'sensor', 'circuito', 'chip', 'placa', 'cabo', 'porta', 'sinal', 'pixel', 'bit',
  'jogo', 'nivel', 'pontos', 'recorde', 'combo', 'fase', 'desafio', 'partida', 'placar', 'ranking',
];

export const feelingWords = [
  'alegria', 'tristeza', 'raiva', 'medo', 'calma', 'paz', 'amor', 'carinho', 'saudade', 'esperanca',
  'coragem', 'cuidado', 'respeito', 'orgulho', 'gratidao', 'felicidade', 'animo', 'energia', 'paciencia', 'foco',
  'sorriso', 'abraco', 'beijo', 'amizade', 'confianca', 'vontade', 'desejo', 'sonho', 'emocao', 'surpresa',
  'curiosidade', 'duvida', 'certeza', 'humor', 'leveza', 'silencio', 'descanso', 'conforto', 'prazer', 'ternura',
  'forca', 'firmeza', 'equilibrio', 'sabedoria', 'bondade', 'alivio', 'entusiasmo', 'inspiracao', 'motivacao', 'serenidade',
];

export const studyWorkWords = [
  'aula', 'licao', 'tarefa', 'prova', 'nota', 'materia', 'curso', 'aluno', 'professor', 'mestre',
  'caderno', 'resumo', 'anotacao', 'leitura', 'escrita', 'conta', 'numero', 'letra', 'palavra', 'frase',
  'projeto', 'reuniao', 'agenda', 'horario', 'prazo', 'meta', 'objetivo', 'plano', 'ideia', 'solucao',
  'trabalho', 'emprego', 'carreira', 'oficio', 'tarefa', 'funcao', 'cargo', 'salario', 'esforco', 'resultado',
  'empresa', 'cliente', 'produto', 'servico', 'venda', 'compra', 'mercado', 'negocio', 'lucro', 'custo',
  'pesquisa', 'estudo', 'teste', 'analise', 'pratica', 'teoria', 'metodo', 'tecnica', 'habito', 'rotina',
  'pasta', 'relatorio', 'planilha', 'grafico', 'tabela', 'dado', 'medida', 'amostra', 'modelo', 'exemplo',
];

export const foodWords = [
  'arroz', 'feijao', 'macarrao', 'pao', 'queijo', 'manteiga', 'leite', 'cafe', 'cha', 'suco',
  'agua', 'fruta', 'banana', 'maca', 'uva', 'pera', 'manga', 'melao', 'abacaxi', 'limao',
  'tomate', 'cebola', 'alho', 'cenoura', 'batata', 'alface', 'pepino', 'milho', 'ervilha', 'abobora',
  'carne', 'frango', 'peixe', 'ovo', 'salada', 'sopa', 'molho', 'tempero', 'sal', 'acucar',
  'bolo', 'doce', 'biscoito', 'sorvete', 'pudim', 'gelatina', 'chocolate', 'mel', 'geleia', 'iogurte',
  'pizza', 'lanche', 'sanduiche', 'pastel', 'salgado', 'torta', 'panqueca', 'omelete', 'risoto', 'sopa',
  'farinha', 'fermento', 'azeite', 'vinagre', 'pimenta', 'canela', 'noz', 'amendoim', 'castanha', 'coco',
];

export const animalWords = [
  'gato', 'cachorro', 'cavalo', 'vaca', 'boi', 'porco', 'ovelha', 'cabra', 'galinha', 'galo',
  'pato', 'ganso', 'peru', 'coelho', 'rato', 'hamster', 'tartaruga', 'sapo', 'cobra', 'lagarto',
  'peixe', 'tubarao', 'baleia', 'golfinho', 'polvo', 'caranguejo', 'camarao', 'estrela', 'agua', 'foca',
  'leao', 'tigre', 'onca', 'lobo', 'raposa', 'urso', 'panda', 'macaco', 'elefante', 'girafa',
  'zebra', 'rinoceronte', 'hipopotamo', 'camelo', 'canguru', 'coala', 'preguica', 'tatu', 'gamba', 'lontra',
  'aguia', 'falcao', 'coruja', 'pomba', 'pardal', 'beija', 'tucano', 'arara', 'papagaio', 'pinguim',
  'abelha', 'formiga', 'borboleta', 'besouro', 'grilo', 'aranha', 'mosca', 'libelula', 'joaninha', 'minhoca',
];

export const adjectiveWords = [
  'grande', 'pequeno', 'alto', 'baixo', 'longo', 'curto', 'largo', 'estreito', 'fundo', 'raso',
  'forte', 'fraco', 'rapido', 'lento', 'leve', 'pesado', 'duro', 'mole', 'liso', 'aspero',
  'novo', 'velho', 'jovem', 'antigo', 'moderno', 'simples', 'dificil', 'facil', 'certo', 'errado',
  'bom', 'ruim', 'melhor', 'otimo', 'legal', 'bonito', 'feio', 'limpo', 'sujo', 'claro',
  'escuro', 'quente', 'frio', 'morno', 'seco', 'molhado', 'cheio', 'vazio', 'inteiro', 'quebrado',
  'feliz', 'triste', 'calmo', 'bravo', 'quieto', 'esperto', 'atento', 'curioso', 'corajoso', 'gentil',
  'doce', 'salgado', 'azedo', 'amargo', 'macio', 'firme', 'redondo', 'quadrado', 'reto', 'torto',
  'rico', 'pobre', 'caro', 'barato', 'raro', 'comum', 'unico', 'duplo', 'triplo', 'enorme',
  'famoso', 'humilde', 'sabio', 'paciente', 'rapido', 'agil', 'preciso', 'constante', 'curto', 'amplo',
];

export const shortWords = [
  'sol', 'mar', 'pao', 'ovo', 'rua', 'flor', 'luz', 'ceu', 'rio', 'lago',
  'cor', 'som', 'voz', 'pe', 'mao', 'olho', 'boca', 'nariz', 'dedo', 'unha',
  'gato', 'pato', 'urso', 'bola', 'rede', 'roda', 'casa', 'mesa', 'sofa', 'cama',
  'azul', 'verde', 'rosa', 'cinza', 'roxo', 'bege', 'creme', 'vinho', 'dourado', 'prata',
  'um', 'dois', 'tres', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'cem',
];

/** Lista com acentos — usada apenas quando includeAccents = true. */
export const accentedWords = [
  'coração', 'ânimo', 'água', 'pé', 'avó', 'avô', 'café', 'chá', 'pão', 'mãe',
  'irmã', 'lição', 'atenção', 'paciência', 'memória', 'história', 'número', 'série', 'área', 'média',
  'rápido', 'fácil', 'difícil', 'álcool', 'açúcar', 'José', 'também', 'até', 'após', 'então',
  'você', 'porém', 'século', 'óculos', 'régua', 'pássaro', 'pêssego', 'maçã', 'limão', 'melão',
  'sabão', 'feijão', 'coração', 'canção', 'estação', 'João', 'leão', 'céu', 'véu', 'chapéu',
];

export const randomWordBank: string[] = [
  ...commonWords,
  ...objectWords,
  ...actionWords,
  ...placeWords,
  ...natureWords,
  ...technologyWords,
  ...feelingWords,
  ...studyWorkWords,
  ...foodWords,
  ...animalWords,
  ...adjectiveWords,
  ...shortWords,
  ...accentedWords,
];

const ACCENT_REGEX = /[áàâãäéèêëíìîïóòôõöúùûüçñ]/i;

export function hasAccent(word: string): boolean {
  return ACCENT_REGEX.test(word);
}

/** Banco normalizado, sem duplicadas nem strings vazias. */
export function getUniqueWordBank(includeAccents = true): string[] {
  const normalized = randomWordBank
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
  const unique = Array.from(new Set(normalized));
  return includeAccents ? unique : unique.filter((word) => !hasAccent(word));
}
