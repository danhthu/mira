import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAsyncAction, useDectectDataChanged } from '../Hooks';

import { useTheme } from '../../../theme';
import { B } from '../../../libs/components';

import { debug } from '..';
import { Repository } from '../Repositories';
import { base } from '../Entities';



export function Selection<TModel extends {icon?,name}& base>(repo:Repository<TModel>){ return ({ route }) => {
  const [selectedList,setSelectedList ] = useState(route.params && route.params.data ? route.params.data : [] as Array<TModel>);
  const selectedListRef = useRef(selectedList);
  const multiple= route.params.multiple||false;
  const data = useAsyncAction(async () => {
    const result = await repo.list();
    return result;
  }, [useDectectDataChanged(repo)]);
  useEffect(()=>{
    selectedListRef.current=selectedList;
  },[selectedList]);

  useEffect(() => {
    return () => {
      route.params && route.params.onGoBack && route.params.onGoBack(multiple? selectedListRef.current||[]:selectedListRef.current[0]||null);
    };
  }, []);

  const handleSelection = ( item, status) => {
    if (status) {
      if(multiple){
        setSelectedList ([...selectedList, item]);
      }else{
        setSelectedList ([item]);
      }
    } else {
      setSelectedList ([...selectedList.filter(h => h.id != item.id)]);
    }
  };



  if (!data) return <View></View>;
  return <FlatList
    data={data}
    renderItem={({ item, index }) => <RowItem item={item} status={selectedList.map(h=>h.id).indexOf(item.id)>-1} handleSelection={()=>handleSelection(item,!(selectedList.map(h=>h.id).indexOf(item.id)>-1))} />}
  />;
};

}
const RowItem =  (props: { item: {id?,icon?,name}, status: boolean, handleSelection }) => {
  const { item, status, handleSelection } = props;
  const [selected, setSelected] = useState(status);
  const style = useStyle();
  return (
    <TouchableOpacity
      key={item.id}
      style={{ flexDirection: 'row' }}
      onPress={() => { setSelected(!selected); handleSelection(item, !selected); }}
    >

      <View style={style.leftContainer}>
        <View style={style.imageContainer}>
          {item.icon ?
            <Image source={{ uri: item.icon }} style={{ width: 40, height: 40 }}></Image>
            : <B.ICon name="target" style={style.image} />
          }
        </View>
        <View style={style.text}><Text>{item.name}</Text></View>
      </View>
      <View style={style.rightContainer}
      >
        {selected ? (
          <B.ICon
            style={style.right_icon_selected}
            name="check-circle"
            size={24}
          />
        ) : (
          <B.ICon
            name="radio-button-off-outline"
            size={24}
            style={style.right_icon_unselected}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const useStyle = () => {
  const colors = useTheme();
  return StyleSheet.create({
    imageContainer: {
      width: 60,
      height: 60,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      alignItems: 'center'
    },
    image: {
      fontSize: 24
    },
    text: {
      flex: 1,
      justifyContent: 'center',
      height: 60
    },

    right_icon_selected: {
      color: colors.primary
    },
    right_icon_unselected: {

    },
    leftContainer: {

      flexDirection: 'row',
      flex: 1,

    },
    rightContainer: {
      alignSelf: 'flex-end',
      height: 60,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};