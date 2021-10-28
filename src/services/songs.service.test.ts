import { getSongsByMethod } from './songs.service';
import { SongModel } from '../models/song';
import { UserModel } from '../models/user';
import { Types } from 'mongoose';

describe('songs service', () => {
    describe('getSongsByMethod', () => {
        it('gets songs by city and state', async () => {
            const user1 = new Types.ObjectId();
            const user2 = new Types.ObjectId();
            const user3 = new Types.ObjectId();

            await SongModel.create({
                title: 'songTitle',
                userId: user1,
                url: 'songUrl',
                city: 'Oakland',
                state: 'CA',
                artistName: 'Cool Dude1',
                songCoverUrl: 'https://url.com',
                genre: 'randb',
            });

            await SongModel.create({
                title: 'songTitle',
                userId: user2,
                url: 'songUrl',
                city: 'Oakland',
                state: 'CA',
                artistName: 'Cool Dude2',
                songCoverUrl: 'https://url.com',
                genre: 'randb',
            });

            await SongModel.create({
                title: 'songTitle',
                userId: user3,
                url: 'songUrl',
                city: 'Berkeley',
                state: 'CA',
                artistName: 'Cool Dude3',
                songCoverUrl: 'https://url.com',
                genre: 'randb',
            });

            await UserModel.create({
                userId: user1,
                firstName: 'Cool Dude 1',
                lastName: 'Dude',
                email: 'email',
                userType: 'artist',
                avatar: 'https://avatar',
                city: 'oakland',
                state: 'cA',
                password: '123546',
                bio: 'Some bio',
                socialMedia: [],
                lat: 37.8043514,
                lng: -122.2711639,
            });

            const songsResponse = await getSongsByMethod({
                method: 'cityState',
                city: 'Oakland',
                state: 'CA',
                page: 1,
            });

            const userIds = songsResponse.map((song) => song.userId);
            expect(songsResponse).toHaveLength(2);
            expect([user1, user2]).toEqual(userIds);
        });
    });
});
