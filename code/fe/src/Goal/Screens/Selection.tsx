

import * as CommonScreen from '../../Common/Screens';
import { Goal, goalRepository } from '../Entities';

export const Selection = CommonScreen.Selection<Goal>(goalRepository); 

/*
import { useEffect, useLayoutEffect, useState } from "react";
import { View, Image, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useAsyncAction, useDectectDataChanged } from "../../Common/Hooks";
import { Goal, GoalAssociate, goalAssociateRepository, goalRepository } from "../Entities";
import { useTheme } from "../../../theme";
import { B } from "../../../libs/components";
import { BButton, BICon } from "../../../libs/components";
import { Router } from "../../../Router";
export const Selection = ({ route, navigation }) => {

    const [selectedList, setSelectedList] = useState(route.params.data.map(h => h.id))
    const style = useStyle()
    const data = useAsyncAction(async () => await goalRepository.list(), [useDectectDataChanged(goalRepository)])
    const handleSelection = (list, item, status) => {
        //check exist  
        // console.log(list,item,status)
        if (status) {
            setSelectedList([...list, item.id])            
            goalAssociateRepository.add({ ...new GoalAssociate, goalId: item.id, table: route.params.table, tableId: route.params.tableId })
            goalAssociateRepository.save()
        } else {
            setSelectedList([...list.filter(h => h != item.id)])
            goalAssociateRepository.delete2(a => a.goalId == item.id && a.table == route.params.table && a.tableId == route.params.tableId)
        }
    };
    useEffect(() => {
        //  console.log(selectedList)
        console.log(selectedList)
    }, [selectedList])
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity style={{ marginRight: 10, height: 30 }} onPress={() => { Router.Open(navigation, 'GoalApp', { screen: 'Add' }) }}>
                <BICon name="pluscircleo" style={{ fontSize: 24 }} />
            </TouchableOpacity>
        })
    }, [navigation])
    return <FlatList
        data={data}
        renderItem={({ item, index }) => <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => handleSelection(selectedList, item, selectedList.indexOf(item.id) > -1 ? false : true)}>

            <View style={style.leftContainer}>
                <View style={style.imageContainer}>
                    {item.icon ?
                        <Image source={{ uri: item.icon }} style={{width:40, height:40}}></Image>
                        : <B.ICon name="target" style={style.image} />
                    }
                </View>
                <View style={style.text}><Text>{item.name}</Text></View>
            </View>
            <View style={style.rightContainer}>
                {selectedList.indexOf(item.id) > -1 ? (
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
        </TouchableOpacity>}
    />
}

const useStyle = () => {
    const colors = useTheme()
    return StyleSheet.create({
        imageContainer: {
            width: 60,
            height: 60,
            alignSelf: 'flex-start',
            justifyContent:'center',
            alignItems:'center'
        },
        image: {            
            fontSize:24
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
    })
}

*/