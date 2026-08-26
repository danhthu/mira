

export type ROUTER_NAME = string

const openNavigation = (navigation, name: ROUTER_NAME, params?: object, callback?: (result) => void) => {
  navigation.navigate(name, { ...params, callback });
};

export const Router = {
  Home: (navigation) => {
    openNavigation(navigation, 'Home');
  },
  Open: (navigation, name: ROUTER_NAME | string, params?: any) => {
    params = params || {};
    const old = params.onGoBack;
    const onGoBack = (...args: any[]) => {
      if (old) {
        old(...args);
      }
    };
    params.onGoBack = onGoBack;
    navigation.navigate(name + (params && params.mode && params.mode == 'modal' ? 'Modal' : ''), params);
  },
  Replace: (navigation, name: ROUTER_NAME | string, params?: any) => {
    const old = params.onGoBack;
    const onGoBack = (...args: any[]) => {
      if (old) {
        old(...args);
      }
    };
    params = params || {};
    params.onGoBack = onGoBack;
    navigation.replace(name + (params && params.mode && params.mode == 'modal' ? 'Modal' : ''), params);
  },
  OpenAddTimeTracker: (
    navigation,
    callback?: (result: { success: boolean }) => void,
  ) => {
    navigation.navigate('TimeTracker_AddModalScreen', {
      onGoBack: (result) => {
        if (callback) {
          callback(result);
        }
      },
    });
  },



  OpenDetailTimeTracker: (navigation, data, callback?: (result) => void) => {
    navigation.navigate('TimeTracker_DetailModalScreen', {
      data,
      onGoBack: (result) => {
        if (callback) {
          callback(result);
        }

      },
    });
  },

  OpenImageSelectorDialog: (navigation, callback: (name: string, cat?: string, src?: string) => void) => {
    navigation.navigate('IconSelectionModal', {
      onGoBack: (name, cat, src) => {
        if (callback) {
          callback(name, cat, src);
        }

      },
    });
    return false;
  }
};
