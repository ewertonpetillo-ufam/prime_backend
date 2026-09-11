import { NotFoundException } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';

describe('QuestionnairesService.patchFreeLivingTestRecommended', () => {
  it('grava e devolve o boolean da indicação', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'q1',
        free_living_test_recommended: false,
      }),
      save: jest.fn(async (row) => row),
    };
    const service = Object.create(
      QuestionnairesService.prototype,
    ) as QuestionnairesService;
    (service as unknown as { questionnairesRepository: typeof repo }).questionnairesRepository =
      repo;

    const result = await service.patchFreeLivingTestRecommended('q1', true);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'q1' } });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ free_living_test_recommended: true }),
    );
    expect(result).toEqual({
      questionnaireId: 'q1',
      freeLivingTestRecommended: true,
    });
  });

  it('lança 404 quando o questionário não existe', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const service = Object.create(
      QuestionnairesService.prototype,
    ) as QuestionnairesService;
    (service as unknown as { questionnairesRepository: typeof repo }).questionnairesRepository =
      repo;

    await expect(
      service.patchFreeLivingTestRecommended('missing', true),
    ).rejects.toThrow(NotFoundException);
    expect(repo.save).not.toHaveBeenCalled();
  });
});
