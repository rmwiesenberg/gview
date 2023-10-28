import {TransitionInterpolator} from '@deck.gl/core/typed'

// Create a type for ViewStates because I can't find one in deck.gl and I like types.
export interface ViewState {
    longitude?: number
    latitude?: number
    zoom?: number
    pitch?: number
    maxPitch?: number
    transitionDuration?: number
    transitionInterpolator?: TransitionInterpolator
}
