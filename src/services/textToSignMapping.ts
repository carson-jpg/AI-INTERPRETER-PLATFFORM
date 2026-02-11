
// Text-to-Sign Language Mapping Database
// Maps English text to sign language configurations

export interface SignConfig {
  handShape: string;
  handPosition: string;
  movement: string;
  facialExpression?: string;
  description: string;
}

export interface TextToSignMapping {
  [word: string]: SignConfig;
}

// Comprehensive text-to-sign mapping for common words and phrases
export const textToSignMapping: TextToSignMapping = {
  // Greetings
  'hello': {
    handShape: 'open_palm',
    handPosition: 'forehead_side',
    movement: 'tap',
    facialExpression: 'smile',
    description: 'Open hand touching forehead and moving outward'
  },
  'hi': {
    handShape: 'open_palm',
    handPosition: 'forehead_side',
    movement: 'tap',
    facialExpression: 'smile',
    description: 'Open hand touching forehead and moving outward'
  },
  'goodbye': {
    handShape: 'open_palm',
    handPosition: 'palm_out',
    movement: 'wave_out',
    facialExpression: 'neutral',
    description: 'Palm facing outward, moving side to side'
  },
  'bye': {
    handShape: 'open_palm',
    handPosition: 'palm_out',
    movement: 'wave_out',
    facialExpression: 'neutral',
    description: 'Palm facing outward, moving side to side'
  },
  'good morning': {
    handShape: 'open_palm',
    handPosition: 'chin_side',
    movement: 'arc_out',
    facialExpression: 'smile',
    description: 'Open hand at chin, moving outward in arc'
  },
  'good afternoon': {
    handShape: 'open_palm',
    handPosition: 'chin_side',
    movement: 'arc_out',
    facialExpression: 'neutral',
    description: 'Open hand at chin, moving outward in arc'
  },
  'good night': {
    handShape: 'fist',
    handPosition: 'chin_side',
    movement: 'close_palm',
    facialExpression: 'sleepy',
    description: 'Fist at chin, closing hand like closing eyes'
  },
  'how are you': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'move_side',
    facialExpression: 'concern',
    description: 'Flat B hand moving horizontally on chest'
  },
  'how are you?': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'move_side',
    facialExpression: 'concern',
    description: 'Flat B hand moving horizontally on chest'
  },
  'i am fine': {
    handShape: 'thumb_index',
    handPosition: 'chest',
    movement: 'tap',
    facialExpression: 'smile',
    description: 'Thumb and index finger together, tapping chest'
  },
  'i am fine.': {
    handShape: 'thumb_index',
    handPosition: 'chest',
    movement: 'tap',
    facialExpression: 'smile',
    description: 'Thumb and index finger together, tapping chest'
  },
  'nice to meet you': {
    handShape: 's_shape',
    handPosition: 'palm_out',
    movement: 'shake',
    facialExpression: 'happy',
    description: 'S hand shaking forward'
  },
  'nice to meet you.': {
    handShape: 's_shape',
    handPosition: 'palm_out',
    movement: 'shake',
    facialExpression: 'happy',
    description: 'S hand shaking forward'
  },
  'thank you': {
    handShape: 'flat_o',
    handPosition: 'mouth_side',
    movement: 'move_out',
    facialExpression: 'grateful',
    description: 'Flat O hand moving from mouth outward'
  },
  'thank you.': {
    handShape: 'flat_o',
    handPosition: 'mouth_side',
    movement: 'move_out',
    facialExpression: 'grateful',
    description: 'Flat O hand moving from mouth outward'
  },
  'thanks': {
    handShape: 'flat_o',
    handPosition: 'mouth_side',
    movement: 'move_out',
    facialExpression: 'grateful',
    description: 'Flat O hand moving from mouth outward'
  },
  'please': {
    handShape: 'flat_o',
    handPosition: 'chest',
    movement: 'circle',
    facialExpression: 'polite',
    description: 'Flat O hand circling on chest'
  },
  'please.': {
    handShape: 'flat_o',
    handPosition: 'chest',
    movement: 'circle',
    facialExpression: 'polite',
    description: 'Flat O hand circling on chest'
  },
  'sorry': {
    handShape: 'fist',
    handPosition: 'chest',
    movement: 'rub',
    facialExpression: 'apologetic',
    description: 'Fist rubbing on chest in circular motion'
  },
  'sorry.': {
    handShape: 'fist',
    handPosition: 'chest',
    movement: 'rub',
    facialExpression: 'apologetic',
    description: 'Fist rubbing on chest in circular motion',
  },
  'excuse me': {
    handShape: 'flat_b',
    handPosition: 'back_hand',
    movement: 'rub',
    facialExpression: 'polite',
    description: 'Flat B hand rubbing back of other hand'
  },
  'excuse me.': {
    handShape: 'flat_b',
    handPosition: 'back_hand',
    movement: 'rub',
    facialExpression: 'polite',
    description: 'Flat B hand rubbing back of other hand'
  },

  // Responses
  'yes': {
    handShape: 'index_extended',
    handPosition: 'forehead_side',
    movement: 'nod',
    facialExpression: 'affirmative',
    description: 'Index finger extended, nodding forward'
  },
  'no': {
    handShape: 'index_extended',
    handPosition: 'forehead_side',
    movement: 'shake_side',
    facialExpression: 'negative',
    description: 'Index finger extended, shaking side to side'
  },
  'maybe': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'tilt',
    facialExpression: 'uncertain',
    description: 'Flat B hand tilting side to side on chest'
  },
  'ok': {
    handShape: 'g_shape',
    handPosition: 'forehead',
    movement: 'rotate',
    facialExpression: 'okay',
    description: 'G hand rotating on forehead'
  },
  'okay': {
    handShape: 'g_shape',
    handPosition: 'forehead',
    movement: 'rotate',
    facialExpression: 'okay',
    description: 'G hand rotating on forehead'
  },
  'good': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'up',
    facialExpression: 'positive',
    description: 'Flat B hand moving upward on chest'
  },
  'great': {
    handShape: 'open_palm',
    handPosition: 'chest_up',
    movement: 'raise',
    facialExpression: 'excited',
    description: 'Open palm raising upward'
  },
  'bad': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'down',
    facialExpression: 'negative',
    description: 'Flat B hand moving downward on chest'
  },

  // Family
  'mother': {
    handShape: 'flat_b',
    handPosition: 'cheek',
    movement: 'rub',
    facialExpression: 'loving',
    description: 'Flat B hand rubbing cheek (feminine movement)'
  },
  'mom': {
    handShape: 'flat_b',
    handPosition: 'cheek',
    movement: 'rub',
    facialExpression: 'loving',
    description: 'Flat B hand rubbing cheek (feminine movement)'
  },
  'father': {
    handShape: 'flat_b',
    handPosition: 'jaw',
    movement: 'tap',
    facialExpression: 'neutral',
    description: 'Flat B hand tapping jaw (masculine movement)'
  },
  'dad': {
    handShape: 'flat_b',
    handPosition: 'jaw',
    movement: 'tap',
    facialExpression: 'neutral',
    description: 'Flat B hand tapping jaw (masculine movement)'
  },
  'brother': {
    handShape: 'flat_b',
    handPosition: 'upper_arm',
    movement: 'move_up',
    facialExpression: 'neutral',
    description: 'Flat B hand moving up on upper arm'
  },
  'sister': {
    handShape: 'flat_b',
    handPosition: 'chin',
    movement: 'move_up',
    facialExpression: 'neutral',
    description: 'Flat B hand moving up on chin'
  },
  'family': {
    handShape: 'fists',
    handPosition: 'chest_cross',
    movement: 'interlock',
    facialExpression: 'loving',
    description: 'Both fists interlocking in front of chest'
  },
  'friend': {
    handShape: 'index_extended',
    handPosition: 'chest_side',
    movement: 'twist',
    facialExpression: 'happy',
    description: 'Index finger twisting on chest'
  },

  // Common Objects
  'water': {
    handShape: 'w_shape',
    handPosition: 'mouth',
    movement: 'pour',
    facialExpression: 'thirsty',
    description: 'W shape hand near mouth, moving like drinking'
  },
  'food': {
    handShape: 'fist',
    handPosition: 'mouth',
    movement: 'eat',
    facialExpression: 'hungry',
    description: 'Fist near mouth, moving like eating'
  },
  'eat': {
    handShape: 'fist',
    handPosition: 'mouth',
    movement: 'eat',
    facialExpression: 'hungry',
    description: 'Fist near mouth, moving like eating'
  },
  'drink': {
    handShape: 'c_shape',
    handPosition: 'mouth',
    movement: 'tilt',
    facialExpression: 'thirsty',
    description: 'C shape hand tilting toward mouth'
  },
  'home': {
    handShape: 'flat_b',
    handPosition: 'house_shape',
    movement: 'frame',
    facialExpression: 'neutral',
    description: 'Both hands forming house shape'
  },
  'house': {
    handShape: 'flat_b',
    handPosition: 'house_shape',
    movement: 'frame',
    facialExpression: 'neutral',
    description: 'Both hands forming house shape'
  },
  'school': {
    handShape: 's_shape',
    handPosition: 'palm_up',
    movement: 'write',
    facialExpression: 'neutral',
    description: 'S hand moving on flat palm like writing'
  },
  'work': {
    handShape: 'flat_b',
    handPosition: 'forehead',
    movement: 'twist',
    facialExpression: 'working',
    description: 'Flat B hand twisting on forehead'
  },
  'book': {
    handShape: 'flat_b',
    handPosition: 'open_book',
    movement: 'open',
    facialExpression: 'reading',
    description: 'Both hands opening like a book'
  },
  'phone': {
    handShape: 'c_shape',
    handPosition: 'ear',
    movement: 'hold',
    facialExpression: 'talking',
    description: 'C shape hand held to ear'
  },
  'computer': {
    handShape: 'flat_b',
    handPosition: 'keyboard',
    movement: 'type',
    facialExpression: 'neutral',
    description: 'Both hands typing motion'
  },
  'car': {
    handShape: 'steering',
    handPosition: 'steering_wheel',
    movement: 'drive',
    facialExpression: 'neutral',
    description: 'Hands steering like driving'
  },
  'time': {
    handShape: 'index_extended',
    handPosition: 'wrist',
    movement: 'point',
    facialExpression: 'neutral',
    description: 'Index finger pointing to wrist'
  },
  'day': {
    handShape: 'flat_b',
    handPosition: 'chin_rotate',
    movement: 'rotate',
    facialExpression: 'neutral',
    description: 'Flat B hand rotating on chin'
  },
  'week': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'week_motion',
    facialExpression: 'neutral',
    description: 'Flat B hand moving in weekly pattern'
  },

  // Emotions
  'happy': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'rub',
    facialExpression: 'smile',
    description: 'Flat B hand rubbing chest in circular motion'
  },
  'love': {
    handShape: 'l_shape',
    handPosition: 'chest',
    movement: 'tap',
    facialExpression: 'loving',
    description: 'L shape hand tapping chest over heart'
  },
  'i love you': {
    handShape: 'l_shape',
    handPosition: 'palm_out',
    movement: 'extend',
    facialExpression: 'loving',
    description: 'L shape hand extending outward with thumb out'
  },
  'sad': {
    handShape: 'flat_b',
    handPosition: 'eyes',
    movement: 'wipe',
    facialExpression: 'sad',
    description: 'Flat B hand wiping eyes'
  },
  'angry': {
    handShape: 'fist',
    handPosition: 'chest',
    movement: 'punch',
    facialExpression: 'angry',
    description: 'Fist punching toward chest'
  },
  'tired': {
    handShape: 'flat_b',
    handPosition: 'face_side',
    movement: 'droop',
    facialExpression: 'tired',
    description: 'Flat B hand drooping on side of face'
  },
  'scared': {
    handShape: 'open_palm',
    handPosition: 'chest',
    movement: 'shake',
    facialExpression: 'scared',
    description: 'Open palm shaking on chest'
  },
  'surprised': {
    handShape: 'open_palm',
    handPosition: 'face',
    movement: 'open',
    facialExpression: 'surprised',
    description: 'Open palms spreading toward face'
  },
  'excited': {
    handShape: 'open_palm',
    handPosition: 'chest_up',
    movement: 'jump',
    facialExpression: 'excited',
    description: 'Open palms jumping upward'
  },
  'proud': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'up_proud',
    facialExpression: 'proud',
    description: 'Flat B hand moving upward with pride'
  },

  // Actions
  'help': {
    handShape: 's_shape',
    handPosition: 'palm_up',
    movement: 'up',
    facialExpression: 'helpful',
    description: 'S hand lifting upward on flat palm'
  },
  'stop': {
    handShape: 'flat_palm',
    handPosition: 'palm_out',
    movement: 'stop',
    facialExpression: 'firm',
    description: 'Flat palm facing outward in stop gesture'
  },
  'go': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'forward',
    facialExpression: 'encouraging',
    description: 'Flat B hand pushing forward'
  },
  'come': {
    handShape: 'index_extended',
    handPosition: 'palm_in',
    movement: 'come_here',
    facialExpression: 'beckoning',
    description: 'Index finger curling toward self'
  },
  'wait': {
    handShape: 'flat_b',
    handPosition: 'palm_out',
    movement: 'wait',
    facialExpression: 'patient',
    description: 'Flat B hand pushing outward then waiting'
  },
  'look': {
    handShape: 'v_shape',
    handPosition: 'eyes',
    movement: 'point_eyes',
    facialExpression: 'observing',
    description: 'V shape hand pointing to eyes'
  },
  'see': {
    handShape: 'v_shape',
    handPosition: 'eyes',
    movement: 'point_eyes',
    facialExpression: 'observing',
    description: 'V shape hand pointing to eyes'
  },
  'listen': {
    handShape: 'flat_b',
    handPosition: 'ear',
    movement: 'cup',
    facialExpression: 'attentive',
    description: 'Flat B hand cupping ear'
  },
  'hear': {
    handShape: 'flat_b',
    handPosition: 'ear',
    movement: 'cup',
    facialExpression: 'attentive',
    description: 'Flat B hand cupping ear'
  },
  'talk': {
    handShape: 'index_extended',
    handPosition: 'mouth',
    movement: 'tap',
    facialExpression: 'talking',
    description: 'Index finger tapping near mouth'
  },
  'speak': {
    handShape: 'index_extended',
    handPosition: 'mouth',
    movement: 'tap',
    facialExpression: 'talking',
    description: 'Index finger tapping near mouth'
  },
  'think': {
    handShape: 'index_curled',
    handPosition: 'forehead',
    movement: 'tap',
    facialExpression: 'thinking',
    description: 'Index finger curled against forehead'
  },
  'know': {
    handShape: 'index_extended',
    handPosition: 'forehead',
    movement: 'twist',
    facialExpression: 'knowing',
    description: 'Index finger twisting on forehead'
  },
  'understand': {
    handShape: 'flat_b',
    handPosition: 'forehead',
    movement: 'down',
    facialExpression: 'understanding',
    description: 'Flat B hand moving down from forehead'
  },
  'remember': {
    handShape: 'index_extended',
    handPosition: 'temple',
    movement: 'tap',
    facialExpression: 'remembering',
    description: 'Index finger tapping temple'
  },
  'forget': {
    handShape: 'flat_b',
    handPosition: 'head',
    movement: 'shake',
    facialExpression: 'forgetful',
    description: 'Flat B hand shaking beside head'
  },
  'want': {
    handShape: 'claw',
    handPosition: 'chest',
    movement: 'pull',
    facialExpression: 'desiring',
    description: 'Claw hand pulling toward chest'
  },
  'need': {
    handShape: 'claw',
    handPosition: 'chest',
    movement: 'pull',
    facialExpression: 'needing',
    description: 'Claw hand pulling toward chest'
  },
  'like': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'rub',
    facialExpression: 'pleased',
    description: 'Flat B hand rubbing chest'
  },
  'dislike': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'push',
    facialExpression: 'displeased',
    description: 'Flat B hand pushing away from chest'
  },

  // Colors
  'red': {
    handShape: 'index_extended',
    handPosition: 'lips',
    movement: 'pull',
    facialExpression: 'neutral',
    description: 'Index finger pulling down on lips'
  },
  'blue': {
    handShape: 'b_shape',
    handPosition: 'chest',
    movement: 'shake',
    facialExpression: 'neutral',
    description: 'B hand shaking side to side'
  },
  'green': {
    handShape: 'g_shape',
    handPosition: 'chest',
    movement: 'grow',
    facialExpression: 'neutral',
    description: 'G hand moving upward like growing'
  },
  'yellow': {
    handShape: 'y_shape',
    handPosition: 'cheek',
    movement: 'rub',
    facialExpression: 'neutral',
    description: 'Y shape hand rubbing cheek'
  },
  'orange': {
    handShape: 'orange_shape',
    handPosition: 'chest',
    movement: 'twist',
    facialExpression: 'neutral',
    description: 'C shape hand twisting on chest'
  },
  'purple': {
    handShape: 'p_shape',
    handPosition: 'chest',
    movement: 'twist',
    facialExpression: 'neutral',
    description: 'P hand twisting on chest'
  },
  'pink': {
    handShape: 'p_shape',
    handPosition: 'cheek',
    movement: 'rub',
    facialExpression: 'neutral',
    description: 'P hand rubbing cheek'
  },
  'black': {
    handShape: 'flat_b',
    handPosition: 'arm',
    movement: 'down',
    facialExpression: 'neutral',
    description: 'Flat B hand moving down on arm'
  },
  'white': {
    handShape: 'flat_b',
    handPosition: 'chest',
    movement: 'wipe',
    facialExpression: 'neutral',
    description: 'Flat B hand wiping on chest'
  },
  'brown': {
    handShape: 'flat_b',
    handPosition: 'arm',
    movement: 'rub',
    facialExpression: 'neutral',
    description: 'Flat B hand rubbing on arm'
  },

  // Numbers
  'zero': {
    handShape: 'o_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'O shape hand, thumb and index touching'
  },
  'one': {
    handShape: 'index_extended',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Index finger extended upward'
  },
  'two': {
    handShape: 'v_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'V shape with index and middle extended'
  },
  'three': {
    handShape: 'three_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Index, middle, and ring extended'
  },
  'four': {
    handShape: 'four_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Four fingers extended'
  },
  'five': {
    handShape: 'open_palm',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'All five fingers extended'
  },
  'six': {
    handShape: 'six_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Index and pinky extended, thumb crossing palm'
  },
  'seven': {
    handShape: 'seven_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Index, middle, and thumb extended'
  },
  'eight': {
    handShape: 'eight_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Index and middle crossed, others extended'
  },
  'nine': {
    handShape: 'nine_shape',
    handPosition: 'palm_up',
    movement: 'still',
    facialExpression: 'neutral',
    description: 'Four fingers extended, pinky curled'
  },
  'ten': {
    handShape: 'crossed',
    handPosition: 'palm_up',
    movement: 'cross',
    facialExpression: 'neutral',
    description: 'Both hands crossed at wrists'
  },

  // Questions
  'what': {
    handShape: 'flat_b',
    handPosition: 'palm_up',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Flat B hand tilted in questioning motion'
  },
  'what?': {
    handShape: 'flat_b',
    handPosition: 'palm_up',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Flat B hand tilted in questioning motion'
  },
  'who': {
    handShape: 'index_extended',
    handPosition: 'palm_up',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Index finger moving in questioning motion'
  },
  'who?': {
    handShape: 'index_extended',
    handPosition: 'palm_up',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Index finger moving in questioning motion'
  },
  'where': {
    handShape: 'index_extended',
    handPosition: 'side',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Index finger pointing to side in questioning motion'
  },
  'where?': {
    handShape: 'index_extended',
    handPosition: 'side',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Index finger pointing to side in questioning motion'
  },
  'when': {
    handShape: 'flat_b',
    handPosition: 'wrist',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Flat B hand touching wrist in questioning motion'
  },
  'when?': {
    handShape: 'flat_b',
    handPosition: 'wrist',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Flat B hand touching wrist in questioning motion'
  },
  'why': {
    handShape: 'curved_b',
    handPosition: 'chest',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Curved B hand twisting on chest'
  },
  'why?': {
    handShape: 'curved_b',
    handPosition: 'chest',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Curved B hand twisting on chest'
  },
  'how': {
    handShape: 'flat_b',
    handPosition: 'palm_up',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Flat B hand tilted in questioning motion'
  },
  'how?': {
    handShape: 'flat_b',
    handPosition: 'palm_up',
    movement: 'question',
    facialExpression: 'curious',
    description: 'Flat B hand tilted in questioning motion'
  },
};

// Hand shape definitions for avatar animation
export const handShapes: { [key: string]: number[][] } = {
  // Normalized hand landmark positions (0-1 range)
  'fist': [
    // Wrist
    [0.5, 1.0],
    // Thumb
    [0.3, 0.9], [0.25, 0.8], [0.22, 0.7], [0.25, 0.6],
    // Index
    [0.35, 0.95], [0.35, 0.85], [0.35, 0.75], [0.35, 0.65],
    // Middle
    [0.5, 0.95], [0.5, 0.85], [0.5, 0.75], [0.5, 0.65],
    // Ring
    [0.65, 0.95], [0.65, 0.85], [0.65, 0.75], [0.65, 0.65],
    // Pinky
    [0.8, 0.95], [0.8, 0.85], [0.8, 0.75], [0.8, 0.65]
  ],
  'open_palm': [
    [0.5, 1.0],
    [0.15, 0.85], [0.1, 0.7], [0.08, 0.55], [0.1, 0.4],
    [0.25, 0.95], [0.22, 0.7], [0.2, 0.45], [0.2, 0.2],
    [0.5, 0.95], [0.5, 0.68], [0.5, 0.42], [0.5, 0.15],
    [0.75, 0.95], [0.78, 0.7], [0.8, 0.45], [0.8, 0.2],
    [0.9, 0.95], [0.92, 0.78], [0.95, 0.6], [0.98, 0.45]
  ],
  'index_extended': [
    [0.5, 1.0],
    [0.25, 0.9], [0.22, 0.8], [0.2, 0.7], [0.3, 0.6],
    [0.35, 0.95], [0.35, 0.75], [0.35, 0.55], [0.35, 0.35],
    [0.5, 0.95], [0.5, 0.85], [0.5, 0.75], [0.5, 0.65],
    [0.65, 0.95], [0.65, 0.85], [0.65, 0.75], [0.65, 0.65],
    [0.8, 0.95], [0.8, 0.85], [0.8, 0.75], [0.8, 0.65]
  ],
  'v_shape': [
    [0.5, 1.0],
    [0.25, 0.9], [0.22, 0.8], [0.2, 0.7], [0.35, 0.65],
    [0.35, 0.95], [0.35, 0.75], [0.35, 0.55], [0.35, 0.35],
    [0.5, 0.95], [0.5, 0.75], [0.5, 0.55], [0.5, 0.35],
    [0.65, 0.95], [0.65, 0.85], [0.65, 0.75], [0.65, 0.65],
    [0.8, 0.95], [0.8, 0.85], [0.8, 0.75], [0.8, 0.65]
  ],
  'l_shape': [
    [0.5, 1.0],
    [0.2, 0.85], [0.15, 0.7], [0.1, 0.55], [0.15, 0.45],
    [0.35, 0.95], [0.35, 0.75], [0.35, 0.55], [0.35, 0.35],
    [0.5, 0.95], [0.5, 0.85], [0.5, 0.75], [0.5, 0.65],
    [0.65, 0.95], [0.65, 0.85], [0.65, 0.75], [0.65, 0.65],
    [0.8, 0.95], [0.8, 0.85], [0.8, 0.75], [0.8, 0.65]
  ],
  'g_shape': [
    [0.5, 1.0],
    [0.3, 0.9], [0.28, 0.8], [0.3, 0.7], [0.4, 0.6],
    [0.35, 0.95], [0.35, 0.75], [0.35, 0.55], [0.35, 0.35],
    [0.5, 0.95], [0.5, 0.85], [0.5, 0.75], [0.5, 0.65],
    [0.65, 0.95], [0.65, 0.85], [0.65, 0.75], [0.65, 0.65],
    [0.8, 0.95], [0.8, 0.85], [0.8, 0.75], [0.8, 0.65]
  ],
  's_shape': [
    [0.5, 1.0],
    [0.3, 0.9], [0.28, 0.82], [0.28, 0.74], [0.32, 0.68],
    [0.38, 0.95], [0.38, 0.87], [0.38, 0.79], [0.38, 0.71],
    [0.5, 0.95], [0.5, 0.87], [0.5, 0.79], [0.5, 0.71],
    [0.62, 0.95], [0.62, 0.87], [0.62, 0.79], [0.62, 0.71],
    [0.75, 0.95], [0.75, 0.87], [0.75, 0.79], [0.75, 0.71]
  ],
  'b_shape': [
    [0.5, 1.0],
    [0.2, 0.9], [0.18, 0.78], [0.18, 0.66], [0.25, 0.58],
    [0.28, 0.95], [0.28, 0.75], [0.28, 0.55], [0.28, 0.35],
    [0.5, 0.95], [0.5, 0.73], [0.5, 0.52], [0.5, 0.3],
    [0.72, 0.95], [0.72, 0.75], [0.72, 0.55], [0.72, 0.35],
    [0.88, 0.95], [0.88, 0.8], [0.88, 0.65], [0.88, 0.5]
  ],
  'flat_b': [
    [0.5, 1.0],
    [0.15, 0.88], [0.12, 0.75], [0.1, 0.62], [0.15, 0.52],
    [0.25, 0.95], [0.22, 0.78], [0.2, 0.6], [0.2, 0.42],
    [0.5, 0.95], [0.5, 0.76], [0.5, 0.58], [0.5, 0.4],
    [0.75, 0.95], [0.78, 0.78], [0.8, 0.6], [0.8, 0.42],
    [0.9, 0.95], [0.92, 0.82], [0.95, 0.68], [0.98, 0.55]
  ],
  'flat_o': [
    [0.5, 1.0],
    [0.25, 0.9], [0.28, 0.82], [0.32, 0.75], [0.38, 0.7],
    [0.35, 0.95], [0.38, 0.88], [0.4, 0.82], [0.42, 0.76],
    [0.5, 0.95], [0.5, 0.88], [0.5, 0.82], [0.5, 0.76],
    [0.65, 0.95], [0.62, 0.88], [0.6, 0.82], [0.58, 0.76],
    [0.8, 0.95], [0.75, 0.9], [0.72, 0.85], [0.7, 0.8]
  ],
  'o_shape': [
    [0.5, 1.0],
    [0.3, 0.9], [0.32, 0.82], [0.35, 0.75], [0.4, 0.7],
    [0.35, 0.95], [0.38, 0.88], [0.4, 0.82], [0.42, 0.76],
    [0.5, 0.95], [0.5, 0.88], [0.5, 0.82], [0.5, 0.76],
    [0.65, 0.95], [0.62, 0.88], [0.6, 0.82], [0.58, 0.76],
    [0.8, 0.95], [0.75, 0.9], [0.72, 0.85], [0.7, 0.8]
  ],
  'w_shape': [
    [0.5, 1.0],
    [0.2, 0.88], [0.18, 0.75], [0.18, 0.62], [0.28, 0.55],
    [0.28, 0.95], [0.28, 0.78], [0.28, 0.6], [0.28, 0.42],
    [0.5, 0.95], [0.5, 0.78], [0.5, 0.6], [0.5, 0.42],
    [0.72, 0.95], [0.72, 0.78], [0.72, 0.6], [0.72, 0.42],
    [0.85, 0.95], [0.85, 0.78], [0.85, 0.6], [0.85, 0.42]
  ],
  'c_shape': [
    [0.5, 1.0],
    [0.2, 0.88], [0.15, 0.72], [0.15, 0.55], [0.25, 0.45],
    [0.3, 0.95], [0.28, 0.78], [0.28, 0.58], [0.3, 0.38],
    [0.5, 0.95], [0.5, 0.75], [0.52, 0.55], [0.55, 0.38],
    [0.7, 0.95], [0.72, 0.78], [0.75, 0.6], [0.78, 0.45],
    [0.88, 0.95], [0.9, 0.82], [0.92, 0.7], [0.95, 0.58]
  ],
  'y_shape': [
    [0.5, 1.0],
    [0.15, 0.88], [0.1, 0.72], [0.08, 0.55], [0.12, 0.4],
    [0.28, 0.95], [0.25, 0.78], [0.22, 0.6], [0.2, 0.42],
    [0.5, 0.95], [0.5, 0.78], [0.5, 0.6], [0.5, 0.42],
    [0.72, 0.95], [0.75, 0.78], [0.78, 0.6], [0.8, 0.42],
    [0.88, 0.95], [0.9, 0.78], [0.92, 0.6], [0.95, 0.42]
  ],
};

// Helper function to convert text to sign sequence
export function textToSignSequence(text: string): SignConfig[] {
  const words = text.toLowerCase().trim().split(/\s+/);
  const signs: SignConfig[] = [];

  for (const word of words) {
    // Remove punctuation
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    if (textToSignMapping[cleanWord]) {
      signs.push(textToSignMapping[cleanWord]);
    } else if (textToSignMapping[word]) {
      signs.push(textToSignMapping[word]);
    } else {
      // Default sign for unknown words (finger spelling)
      signs.push({
        handShape: 'flat_b',
        handPosition: 'palm_up',
        movement: 'point',
        facialExpression: 'neutral',
        description: `Unknown word: ${cleanWord}`
      });
    }
  }

  return signs;
}

// Helper function to get animation duration based on number of signs
export function getAnimationDuration(signs: SignConfig[]): number {
  return signs.length * 1500; // 1.5 seconds per sign
}

// Helper function to get sign config for a single word
export function getWordSignConfig(word: string): SignConfig | null {
  const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
  
  // Check for direct match
  if (textToSignMapping[cleanWord]) {
    return textToSignMapping[cleanWord];
  }
  
  // Check with original word
  if (textToSignMapping[word]) {
    return textToSignMapping[word];
  }
  
  // Return default sign
  return {
    handShape: 'flat_b',
    handPosition: 'palm_up',
    movement: 'point',
    facialExpression: 'neutral',
    description: `Default sign for: ${cleanWord}`
  };
}
