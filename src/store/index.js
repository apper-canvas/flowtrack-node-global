import { configureStore } from '@reduxjs/toolkit'
import userSlice from './userSlice'

export const store = configureStore({
  reducer: {
    user: userSlice,
  },
})

// TypeScript type exports removed - not supported in JavaScript files
// For type safety, convert this file to TypeScript (.ts) and use:
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch