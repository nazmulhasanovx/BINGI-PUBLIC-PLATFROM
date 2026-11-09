import React from 'react';
import { Composition, delayRender, continueRender } from 'remotion';
import { fontsReady, LOOP } from './kit';
import { Calendar } from './Calendar';
import { Housekeeping } from './Housekeeping';
import { Restaurant } from './Restaurant';
import { Cashbox } from './Cashbox';
import { Staff } from './Staff';
import { Website } from './Website';

const h = delayRender('fonts');
fontsReady.then(() => continueRender(h));

// Sizes match the public site's media slots (website/src/data/media.ts).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="bentoCalendar" component={Calendar} durationInFrames={LOOP} fps={30} width={1600} height={700} />
    <Composition id="bentoHousekeep" component={Housekeeping} durationInFrames={LOOP} fps={30} width={800} height={700} />
    <Composition id="bentoRestaurant" component={Restaurant} durationInFrames={LOOP} fps={30} width={1200} height={750} />
    <Composition id="bentoCash" component={Cashbox} durationInFrames={LOOP} fps={30} width={1200} height={750} />
    <Composition id="bentoStaff" component={Staff} durationInFrames={LOOP} fps={30} width={1200} height={750} />
    <Composition id="bentoWebsite" component={Website} durationInFrames={LOOP} fps={30} width={2400} height={800} />
  </>
);
