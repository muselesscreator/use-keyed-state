jest.mock('react-intl', () => {
  const i18n = jest.requireActual('react-intl');
  const { formatMessage } = jest.requireActual('testUtils');
  return {
    ...i18n,
    useIntl: jest.fn(() => ({ formatMessage })),
    defineMessages: m => m,
  };
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn((cb, prereqs) => ({ useEffect: { cb, prereqs } })),
  useRef: jest.fn((val) => ({ current: val, useRef: true })),
}));
