import {
    Action,
    combineReducers,
    configureStore,
    ThunkAction,
} from '@reduxjs/toolkit'

import layersReducer from '../features/layersSlice'

const reducers = combineReducers({
    layers: layersReducer,
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
