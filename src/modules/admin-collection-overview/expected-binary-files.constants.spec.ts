import { sortCollectionTaskCodes } from './expected-binary-files.constants';

describe('sortCollectionTaskCodes', () => {
  it('coloca FL01 e FL02 depois de todas as TAs', () => {
    expect(
      sortCollectionTaskCodes([
        'FL01',
        'TA1',
        'FL02',
        'TA2',
        'TA10',
        'TA13',
        'TA18',
      ]),
    ).toEqual(['TA1', 'TA2', 'TA10', 'TA13', 'TA18', 'FL01', 'FL02']);
  });
});
