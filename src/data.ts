import { Era } from './types.ts';

// Dynamic import paths or public paths for pre-generated historical scenes
import egyptImg from './assets/images/egyptian_pharaoh_court_1780461037921.png';
import medievalImg from './assets/images/medieval_jousting_tournament_1780461055852.png';
import speakeasyImg from './assets/images/twenties_jazz_speakeasy_1780461073281.png';
import moonImg from './assets/images/moon_landing_1969_1780461088776.png';
import jurassicImg from './assets/images/jurassic_jungle_dinosaurs_1780461103277.png';

export const HISTORICAL_ERAS: Era[] = [
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    year: '1324 BCE',
    period: 'pharaoh',
    description: 'Enter the dazzling Court of King Tutankhamun. Glow in warm torchlight and sandstone inscriptions, surrounded by statues of Ra and Anubis.',
    image: egyptImg,
    historicalRole: 'Pharaoh\'s Royal Advisor',
    suggestedPrompts: [
      'A wise vizier in fine linen robes',
      'The supreme high priest of Heliopolis',
      'A master builder planning the great obelisk'
    ],
    defaultFaceProps: {
      x: 50,
      y: 35,
      scale: 0.9,
      rotation: 0,
      feather: 15,
      brightness: 110,
      contrast: 110,
      sepia: 15,
      grayscale: 0,
      opacity: 100,
      hFlip: false,
      cropShape: 'oval'
    }
  },
  {
    id: 'medieval-england',
    name: 'Medieval Kingdom',
    year: '1215 CE',
    period: 'medieval',
    description: 'Anoint yourself as noble loyalty or champion knight on the grand Jousting Tournament Field under castle spires and chivalrous banners.',
    image: medievalImg,
    historicalRole: 'Valiant Champion Knight',
    suggestedPrompts: [
      'A knight returning in gleaming chainmail',
      'The royal court jester with mysterious wisdom',
      'A noble ruler presiding over the tournament'
    ],
    defaultFaceProps: {
      x: 50,
      y: 30,
      scale: 0.8,
      rotation: 0,
      feather: 18,
      brightness: 105,
      contrast: 105,
      sepia: 10,
      grayscale: 0,
      opacity: 100,
      hFlip: false,
      cropShape: 'vintage-frame'
    }
  },
  {
    id: 'roaring-twenties',
    name: 'Roaring Twenties',
    year: '1926 CE',
    period: 'roaring-20s',
    description: 'Step into a smoky, subterranean jazz club. Sip secret recipes amidst brass instruments, jazz drums, and high-fashion Art Deco elegance.',
    image: speakeasyImg,
    historicalRole: 'Avant-Garde Jazz Sensation',
    suggestedPrompts: [
      'A boundary-pushing jazz virtuoso',
      'A mysterious theatrical agent or director',
      'An underground bootleg tycoon planning the party'
    ],
    defaultFaceProps: {
      x: 45,
      y: 40,
      scale: 0.85,
      rotation: -5,
      feather: 20,
      brightness: 95,
      contrast: 100,
      sepia: 75,
      grayscale: 10,
      opacity: 95,
      hFlip: false,
      cropShape: 'circle'
    }
  },
  {
    id: 'moon-landing',
    name: 'Apollo 11 Moon Landing',
    year: '1969 CE',
    period: 'space-race',
    description: 'Stand proudly alongside the Apollo lander on the gray craters of the Moon. Watch the blue-and-white home sphere rising in cosmic silence.',
    image: moonImg,
    historicalRole: 'Apollo Mission Commander',
    suggestedPrompts: [
      'A legendary astronaut staring into the void',
      'A brilliant flight director celebrating in style',
      'The pioneer first-stepper of the human race'
    ],
    defaultFaceProps: {
      x: 50,
      y: 35,
      scale: 0.75,
      rotation: 0,
      feather: 12,
      brightness: 120,
      contrast: 125,
      sepia: 0,
      grayscale: 100,
      opacity: 100,
      hFlip: false,
      cropShape: 'circle'
    }
  },
  {
    id: 'jurassic-era',
    name: 'Jurassic Cretaceous Era',
    year: '145M BCE',
    period: 'prehistory',
    description: 'Descend into a misty prehistoric valley of massive ferns, primordial steam holes, and friendly long-necked herbivorous giants.',
    image: jurassicImg,
    historicalRole: 'Chrono-Explorer',
    suggestedPrompts: [
      'A pioneering chrono-researcher with high-tech sensors',
      'A rugged wanderer looking sideways in awe',
      'The world\'s very first paleo-cartographer'
    ],
    defaultFaceProps: {
      x: 50,
      y: 45,
      scale: 0.9,
      rotation: 0,
      feather: 15,
      brightness: 100,
      contrast: 100,
      sepia: 5,
      grayscale: 0,
      opacity: 100,
      hFlip: false,
      cropShape: 'soft-square'
    }
  }
];

export interface SampleFace {
  id: string;
  name: string;
  image: string;
  gender: string;
  desc: string;
}

export const SAMPLE_FACES: SampleFace[] = [
  {
    id: 'face-1',
    name: 'Dapper Explorer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300',
    gender: 'male',
    desc: 'Determined historical stare, great for vintage styles.'
  },
  {
    id: 'face-2',
    name: 'Awe-struck Scholar',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300',
    gender: 'female',
    desc: 'Bright and energetic, perfect for an excited traveller.'
  },
  {
    id: 'face-3',
    name: 'Chrono Lieutenant',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300',
    gender: 'male',
    desc: 'Direct camera focus, amazing for the space mission helmet.'
  },
  {
    id: 'face-4',
    name: 'Elegant Archivist',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300',
    gender: 'female',
    desc: 'Warm and gentle smile, matches classical Renaissance paintings.'
  }
];
