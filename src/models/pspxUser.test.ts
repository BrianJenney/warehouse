import { PspxUserModel } from './pspxUser';

describe('PspxUserModel', () => {
    it('only allows unique emails', async () => {
        try {
            await PspxUserModel.create({ email: '420guy@hotmail.com' });
            await PspxUserModel.create({ email: '420guy@hotmail.com' });
        } catch (e) {
            expect(e).toBeDefined();
        }
    });
});
