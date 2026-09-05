import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Router } from '../../../Router';
import { useSettings } from '../../Common/Hooks';
import { uuid } from '../../Common/Utils/common';
import { PersonRole } from '../../Core/types';
import { StepCadence } from '../Components/StepCadence';
import { StepDone } from '../Components/StepDone';
import { StepNames } from '../Components/StepNames';
import { StepRoles } from '../Components/StepRoles';
import { useWelcomeStyle } from '../Components/styles';
import { FIRST_STEP, LAST_STEP } from '../Models/constants';
import {
  PersonDraft,
  addDraft,
  removeDraft,
  renameDraft,
  setCadence,
  toggleRole,
} from '../Models/draft';
import { saveDrafts } from '../Models/save';
import { useText } from '../Text';

/**
 * Onboarding bốn bước của `05-v1-spec.md`: mỗi bước một câu hỏi, bỏ qua được hết.
 *
 * Không hỏi tuổi, không hỏi khoảng cách, không hỏi thu nhập. Tuổi và khoảng cách
 * chỉ hỏi sau, khi người dùng chủ động bật Đồng hồ cát trong Cài đặt — ràng buộc
 * cứng #4 và `00-vision.md` rủi ro #1.
 */
export const Home = () => {
  const style = useWelcomeStyle();
  const text = useText();
  const nav = useNavigation();
  const [, setSettings] = useSettings();
  const [step, setStep] = useState(FIRST_STEP);
  const [drafts, setDrafts] = useState<readonly PersonDraft[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  // Lưu ngay khi vào bước cuối, không đợi chạm "bắt đầu": người đóng app ở màn
  // "xong" vẫn giữ được danh sách vừa nhập.
  const goTo = async (next: number) => {
    setStep(next);
    if (next === LAST_STEP) setSavedCount(await saveDrafts(drafts));
  };

  const finish = () => {
    // Cờ riêng cho "đã đi qua onboarding". KHÔNG dùng `is_first_init`: App.tsx đặt
    // cờ đó ngay lần chạy đầu cho việc khác, nên dùng nó ở đây thì màn onboarding
    // không bao giờ hiện ra được.
    setSettings({ hasSetupProfile: true });
    Router.Home(nav);
  };

  const question =
    step === 1 ? text.step1Question : step === 2 ? text.step2Question : text.step3Question;
  const hint = step === 1 ? text.step1Hint : step === 2 ? text.step2Hint : text.step3Hint;

  return (
    <View style={style.screen}>
      <View style={style.content}>
        <Text style={style.stepCount}>
          {`${text.stepPrefix} ${step}${text.stepSeparator}${LAST_STEP}`}
        </Text>

        {step === LAST_STEP ? null : (
          <View>
            <Text style={style.question}>{question}</Text>
            <Text style={style.hint}>{hint}</Text>
          </View>
        )}

        {step === 1 ? (
          <StepRoles
            drafts={drafts}
            onToggle={(role: PersonRole) => setDrafts(toggleRole(drafts, role, uuid()))}
          />
        ) : null}

        {step === 2 ? (
          <StepNames
            drafts={drafts}
            onRename={(key, name) => setDrafts(renameDraft(drafts, key, name))}
            onAdd={(role) => setDrafts(addDraft(drafts, role, uuid()))}
            onRemove={(key) => setDrafts(removeDraft(drafts, key))}
          />
        ) : null}

        {step === 3 ? (
          <StepCadence
            drafts={drafts}
            onChange={(key, cadence) => setDrafts(setCadence(drafts, key, cadence))}
          />
        ) : null}

        {step === LAST_STEP ? <StepDone savedCount={savedCount} /> : null}
      </View>

      <View style={style.footer}>
        <View style={style.footerSide}>
          {step > FIRST_STEP && step < LAST_STEP ? (
            <Pressable
              accessibilityRole="button"
              style={style.ghostAction}
              onPress={() => setStep(step - 1)}
            >
              <Text style={style.ghostActionText}>{text.back}</Text>
            </Pressable>
          ) : null}
          {step < LAST_STEP ? (
            <Pressable
              accessibilityRole="button"
              style={style.ghostAction}
              onPress={() => goTo(LAST_STEP)}
            >
              <Text style={style.ghostActionText}>{text.skip}</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          style={style.primaryAction}
          onPress={() => (step === LAST_STEP ? finish() : goTo(step + 1))}
        >
          <Text style={style.primaryActionText}>
            {step === LAST_STEP ? text.finish : text.next}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
