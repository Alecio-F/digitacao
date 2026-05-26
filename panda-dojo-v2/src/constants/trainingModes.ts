export const TRAINING_MODES = {
  randomWords: 'randomWords',
  baseKeys: 'baseKeys',
  leftHand: 'leftHand',
  rightHand: 'rightHand',
  accents: 'accents',
  numbers: 'numbers',
  punctuation: 'punctuation',
  shortSentences: 'shortSentences',
  focusMode: 'focusMode',
} as const;

export type TrainingMode = (typeof TRAINING_MODES)[keyof typeof TRAINING_MODES];
