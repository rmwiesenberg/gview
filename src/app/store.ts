import {
    Action,
    combineReducers,
    configureStore,
    ThunkAction,
} from '@reduxjs/toolkit'

import layersReducer from '../features/layersSlice'
import viewReducer from '../features/viewSlice'

const reducers = combineReducers({
    layers: layersReducer,
    view: viewReducer,
})

export const store = configureStore({
    reducer: reducers,
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>
