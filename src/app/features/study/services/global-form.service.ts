import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MultipleChoiceData } from '../models/multiple-choice.model';
import { WelcomeScreenData } from '../models/welcome-screen.model';
import { YesNoData } from '../models/yes-no.model';
import { OpenQuestionData } from '../models/open-question.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalFormService {

  private formState = {
    welcomeScreen: new BehaviorSubject<WelcomeScreenData>({ title: '', subtitle: '' }),
    openQuestion: new BehaviorSubject<OpenQuestionData>({ title: '', subtitle: '' }),
    yesNo: new BehaviorSubject<YesNoData>({ title: '', subtitle: '' }),
    multipleChoice: new BehaviorSubject<MultipleChoiceData>({ title : '', subtitle: '', selectionType: 'single', options: [] }),
    // Agregás cada componente
  };

  // Getters
  getWelcomeScreenData() {
    return this.formState.welcomeScreen.asObservable();
  }

  // Setters
  setWelcomeScreenData(data: WelcomeScreenData) {
    this.formState.welcomeScreen.next(data);
  }

  // YES/NO
  private selectedYesNoOption = new BehaviorSubject<'yes' | 'no' | null>(null);

  getYesNoData() {
    return this.formState.yesNo.asObservable();
  }

  setSelectedYesNoOption(option: 'yes' | 'no') {
    this.selectedYesNoOption.next(option);
  }

  getSelectedYesNoOption() {
    return this.selectedYesNoOption.asObservable();
  }

  setYesNoData(data: YesNoData) {
    this.formState.yesNo.next(data);
  }
  // END YES/NO

  // OPEN QUESTION
  getOpenQuestionData() {
    return this.formState.openQuestion.asObservable();
  }

  setOpenQuestionData(data: OpenQuestionData) {
    this.formState.openQuestion.next(data);
  }
  // END OPEN QUESTION

  // MULTIPLE CHOICE
  private multipleChoiceData = new BehaviorSubject<MultipleChoiceData>({
    title: '',
    subtitle: '',
    selectionType: 'single',
    options: []
  });

  setMultipleChoiceData(data: MultipleChoiceData) {
    this.multipleChoiceData.next(data);
  }

  getMultipleChoiceData() {
    return this.multipleChoiceData.asObservable();
  }
  // END MULTIPLE CHOICE
}
