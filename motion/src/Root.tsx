import React from 'react';
import { Composition, delayRender, continueRender } from 'remotion';
import { fontsReady, LOOP } from './kit';
import { PlanDashboard, robotoReady, SEG } from './PlanDashboard';
import { Calendar } from './Calendar';
import { Housekeeping } from './Housekeeping';
import { Restaurant } from './Restaurant';
import { Cashbox } from './Cashbox';
import { Staff } from './Staff';
import { Website } from './Website';
import { Dashboard, BookingsList, CheckIn, GuestApp, MobileToday } from './Screens';

const h = delayRender('fonts');
Promise.all([fontsReady, robotoReady]).then(() => continueRender(h));

// Sizes match the public site's media slots (website/src/data/media.ts).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="bentoCalendar" component={Calendar} durationInFrames={LOOP} fps={30} width={1600} height={700} />
    <Composition id="bentoHousekeep" component={Housekeeping} durationInFrames={LOOP} fps={30} width={800} height={700} />
    <Composition id="bentoRestaurant" component={Restaurant} durationInFrames={LOOP} fps={30} width={1200} height={750} />
    <Composition id="bentoCash" component={Cashbox} durationInFrames={LOOP} fps={30} width={1200} height={750} />
    <Composition id="bentoStaff" component={Staff} durationInFrames={LOOP} fps={30} width={1200} height={750} />
    <Composition id="bentoWebsite" component={Website} durationInFrames={LOOP} fps={30} width={2400} height={800} />
    {/* hero / platform / story slots (sizes keep each slot's aspect ratio) */}
    <Composition id="heroWeb" component={PlanDashboard} durationInFrames={SEG * 3} fps={30} width={1600} height={900} />
    <Composition id="dashStarter" component={PlanDashboard} durationInFrames={SEG} fps={30} width={1600} height={900} defaultProps={{ only: 'starter' }} />
    <Composition id="dashBusiness" component={PlanDashboard} durationInFrames={SEG} fps={30} width={1600} height={900} defaultProps={{ only: 'business' }} />
    <Composition id="dashUltra" component={PlanDashboard} durationInFrames={SEG} fps={30} width={1600} height={900} defaultProps={{ only: 'ultra' }} />
    <Composition id="heroWebOld" component={Dashboard} durationInFrames={LOOP} fps={30} width={1600} height={900} />
    <Composition id="heroPhone" component={GuestApp} durationInFrames={LOOP} fps={30} width={660} height={1434} />
    <Composition id="platformWeb" component={Calendar} durationInFrames={LOOP} fps={30} width={1600} height={900} defaultProps={{ w: 1600, h: 900, lw: 640 }} />
    <Composition id="platformMobile" component={MobileToday} durationInFrames={LOOP} fps={30} width={660} height={1434} />
    <Composition id="story1" component={BookingsList} durationInFrames={LOOP} fps={30} width={1280} height={720} />
    <Composition id="story2" component={Calendar} durationInFrames={LOOP} fps={30} width={1280} height={720} defaultProps={{ w: 1280, h: 720, lw: 640 }} />
    <Composition id="story3" component={CheckIn} durationInFrames={LOOP} fps={30} width={1280} height={720} />
    <Composition id="story4" component={Restaurant} durationInFrames={LOOP} fps={30} width={1280} height={720} defaultProps={{ w: 1280, h: 720, lw: 420 }} />
    <Composition id="story5" component={Housekeeping} durationInFrames={LOOP} fps={30} width={1280} height={720} defaultProps={{ w: 1280, h: 720, lw: 470 }} />
  </>
);
