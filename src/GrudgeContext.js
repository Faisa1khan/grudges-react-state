import React, { useReducer, createContext, useCallback } from 'react';
import initialState from './initialState';
import id from 'uuid/v4';

export const GrudgeContext = createContext();

const GRUDGE_ADD = 'GRUDGE_ADD';
const GRUDGE_FORGIVE = 'GRUDGE_FORGIVE';

const reducer = (state = defaultState, action) => {
  if (action.type === GRUDGE_ADD) {
    const newPreset = [
      {
        id: id(),
        ...action.payload
      },
      ...state.present
    ];

    return {
      past: [state.present, ...state.past],
      present: newPreset,
      future: []
    };
  }

  if (action.type === GRUDGE_FORGIVE) {
    const newPreset = state.present.map(grudge => {
      if (grudge.id === action.payload.id) {
        return { ...grudge, forgiven: !grudge.forgiven };
      }

      return grudge;
    });
    return {
      past: [state.present, ...state.past],
      present: newPreset,
      future: []
    };
  }

  if (action.type === 'UNDO') {
    const [newPreset, ...newPast] = state.past;

    return {
      past: newPast,
      present: newPreset,
      future: [state.present, ...state.future]
    };
  }

  if (action.type === 'REDO') {
    console.log('future');
    const [newPreset, ...newFuture] = state.future;
    return {
      past: [state.present, ...state.past],
      present: newPreset,
      future: newFuture
    };
  }

  return state;
};

const defaultState = {
  past: [],
  present: initialState,
  future: []
};

export const GrudgeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const grudges = state.present;
  const isPast = !!state.past.length;
  const isFuture = !!state.future.length;

  const addGrudge = useCallback(
    ({ person, reason }) => {
      dispatch({
        type: GRUDGE_ADD,
        payload: {
          person,
          reason
        }
      });
    },
    [dispatch]
  );

  const toggleForgiveness = useCallback(
    id => {
      dispatch({
        type: GRUDGE_FORGIVE,
        payload: {
          id
        }
      });
    },
    [dispatch]
  );

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  return (
    <GrudgeContext.Provider
      value={{
        grudges: grudges,
        addGrudge,
        toggleForgiveness,
        undo,
        redo,
        isFuture,
        isPast
      }}
    >
      {children}
    </GrudgeContext.Provider>
  );
};
