import React from 'react';
import {Composition} from 'remotion';
import {Promo, PromoProps} from './Promo';
import {FPS, LAYOUT, TOTAL_FRAMES} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BieraH"
      component={Promo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={LAYOUT.h.width}
      height={LAYOUT.h.height}
      defaultProps={{orientation: 'h'} satisfies PromoProps}
    />
    <Composition
      id="BieraV"
      component={Promo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={LAYOUT.v.width}
      height={LAYOUT.v.height}
      defaultProps={{orientation: 'v'} satisfies PromoProps}
    />
  </>
);
