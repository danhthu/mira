import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { BICon, BText as Text } from '../../../../libs/components';
import { ButtonV2 } from '../../../../libs/components/Buttons';
import { Router } from '../../../../Router';
import { useTheme } from '../../../../theme';
import {
  BLACK_COLOR,
  FONT_SIZE,
  FONTSIZE,
  HEADER_HEIGHT,
  ROUND_BIG,
  SECOND_BLACK_COLOR
} from '../../../../theme/Constraints';
import { useAsyncAction } from '../../../Common/Hooks';
import { useCommonStyle } from '../../../Common/Styles';
import { AssetManagement } from '../../Assets/';
import iconifyAssets from '../../Assets/iconifyAssets';
import { Header } from '../../Components/Header';
import { habitRepository, habitTemplateRepository } from '../../Entities';
import { useText } from '../../Text';
import { AddableHabits } from './AddableHabits';
import TabSlider from './TabSlider';

export const Home = ({ navigation, route }) => {
  const [showTitle, setShowTitle] = useState(false);
  const text = useText();
  const colors = useTheme();
  const commonStyle = useCommonStyle();
  return (
    <View style={[commonStyle.screen]}>
      <Header
        title={showTitle ? text.pick_a_new_one || 'Pick a new one' : null}
      />
      <ScrollView onScroll={evt => {
        if (!showTitle && evt.nativeEvent.contentOffset.y > HEADER_HEIGHT) {
          setShowTitle(true);
        }
        if (evt.nativeEvent.contentOffset.y < HEADER_HEIGHT && showTitle) {
          setShowTitle(false);
        }
      }}>
        <View style={{ flex: 1 }}>

          <Text style={{ fontWeight: 'bold', fontSize: FONT_SIZE.PageTitle }}>{text.pick_a_new_one || 'Pick a new one'}</Text>
          <TabSlider style={{ marginTop: 20, marginBottom: 20 }} tabs={[text.popular || 'Polular', text.all || 'All']}>
            <>
              <PopularCollection />
              <Groups />
            </>
            <AllHabits />
          </TabSlider>
        </View>
      </ScrollView>
      <View style={{
        position: 'absolute',
        bottom: 20, // Khoảng cách từ dưới cùng của màn hình (hoặc có thể là 0 nếu muốn sát đáy)
        left: 0,
        right: 0, // Chiều rộng button sẽ được căn đều theo màn hình
        justifyContent: 'center', // Căn giữa button theo chiều ngang
        alignItems: 'center',
      }}>
        <ButtonV2 variant='secondary' text={text.add_my_own || 'Add my own'} onPress={() => {
          Router.Open(navigation, 'HabitAppModal', { screen: 'AddModal' });
        }} />
      </View>
    </View>
  );
};

const AllHabits = () => {
  const [data, setData] = useState([]);
  useAsyncAction(async () => {
    const habits = (await habitRepository.list()).map(h => h.id);
    const tmp = (await habitTemplateRepository.list()).map((h) => ({
      ...h,
      status: habits.includes(h.id) ? 'DONE' : undefined
    }));
    setData(tmp);
  }, []);

  return <AddableHabits habits={data} />;
};

const PopularCollection = () => {
  const text = useText();
  const nav = useNavigation();
  const [data, setData] = useState([]);
  useAsyncAction(async () => {
    setData(
      (await habitTemplateRepository.filter((h) => h.collection !== null))
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.collection === item.collection),
        )
        .map((h) => ({
          text: h.collection,
          img: h.collection_icon,
          color: h.color,
        })),
    );
  }, []);
  const catStyle = StyleSheet.create({
    container: {
      marginRight: 20,
    },
    text: {
      fontSize: FONTSIZE.SMALL,
      color: SECOND_BLACK_COLOR,
      textAlign: 'center',
      width: 130,
      overflow: 'hidden',
    },
    img: {
      width: 130,
      height: 130,
    },
    img_container: {
      borderRadius: ROUND_BIG,
      justifyContent: 'center',
      alignItems: 'center',
      width: 130,
      height: 130,
    },
  });

  return (
    <View>
      <View>
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={{
              width: 30,
              height: 30,
              marginRight: 5,
            }}
            source={AssetManagement['popular']}
          />
          <Text
            style={{
              color: BLACK_COLOR,
              fontWeight: 'bold',
              lineHeight: 30,
              height: 30,
              fontSize: FONTSIZE.Title,
            }}
          >
            {text.Popular_collections || 'Popular collections'}
          </Text>
        </View>
        <Text style={{ color: SECOND_BLACK_COLOR, fontSize: FONTSIZE.SMALL }}>
          {text.Monitor_that_you_have_unsaved_changes ||
            'Monitor that you have unsaved changes'}
        </Text>
      </View>
      <ScrollView horizontal>
        <View>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            {data.map((c, i) => (
              <TouchableOpacity
                onPress={() =>
                  Router.Open(nav, 'HabitTrackerAppModal', {
                    screen: 'HomeDetailModal',
                    collection: c,
                  })
                }
                key={i}
                style={{
                  marginRight: 20,
                }}
              >
                <View
                  style={[catStyle.img_container, { backgroundColor: c.color }]}
                >
                  <Image
                    style={catStyle.img}
                    source={
                      AssetManagement[c.img] ||
                      iconifyAssets['emojione--astonished-face']
                    }
                  />
                </View>
                <Text style={catStyle.text}>{c.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Groups = () => {
  const [data, setData] = useState([]);
  useAsyncAction(async () => {
    const all = await habitTemplateRepository.list();
    const habits = (await habitRepository.list()).map(h => h.id);
    const data = all
      .filter((h) => h.group !== null)
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.group === item.group),
      )
      .map((h) => ({
        ...h,
        text: h.group,
        img: h.group_icon,
        desc: h.group_desc,
        children: all
          .filter((hh) => hh.group == h.group)
          .map((k) => ({ ...k, status: habits.includes(k.id) ? 'DONE' : undefined })),
      }));

    setData(data);
  }, []);
  const colors = useTheme();
  const nav = useNavigation();
  const text = useText();
  const styles = StyleSheet.create({
    group_container: {},
    group_image: {
      width: 30,
      height: 30,
      marginRight: 5,
    },
    group_title: {
      lineHeight: 30,
      color: BLACK_COLOR,
      fontWeight: 'bold',
      fontSize: FONTSIZE.Title,
    },
    group_desc: {
      color: SECOND_BLACK_COLOR,
      fontSize: FONTSIZE.SMALL,
    },
  });

  return (
    <>
      {data.map((g, i) => (
        <View key={i}>
          <View
            key={i}
            style={[
              {
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 5,
              },
            ]}
          >
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={[{ flexDirection: 'row' }]}>
                <Image
                  style={styles.group_image}
                  source={
                    AssetManagement[g.img] || AssetManagement.habit_default
                  }
                />
                <Text style={styles.group_title}>{g.text}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                Router.Open(nav, 'HabitTrackerAppModal', {
                  screen: 'HomeDetailModal',
                  group: g,
                })
              }
              style={[
                {
                  alignSelf: 'flex-end',
                  flexDirection: 'row',
                  width: 50,
                  alignItems: 'center',
                  height: 50,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: FONTSIZE.SMALL,
                  lineHeight: 30,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {text.All || 'All'}
              </Text>
              <BICon
                name="right"
                style={{
                  lineHeight: 30,
                  marginLeft: 3,
                  fontSize: FONTSIZE.SSMALL,
                }}
              />
            </TouchableOpacity>
          </View>
          <>{g.children && <AddableHabits habits={g.children} />}</>
        </View>
      ))}
    </>
  );
};
