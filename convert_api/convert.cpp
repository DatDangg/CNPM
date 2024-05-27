#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>

using namespace std;

struct Question {
    string stt; // Số thứ tự câu hỏi
    string question;
    string answers[4];
    string key;
    string image;
    string audio;
    string check;
    string trans;
    string explain;

};

vector<Question> readDataFromFile(const string& filename) {
    vector<Question> questions;
    ifstream file(filename);

    if (file.is_open()) {
        string line;
        while (getline(file, line)) {
            if (!line.empty()) {
                stringstream ss(line);
                string token;
                Question q;
                int i = 0;
                while (getline(ss, token, '|')) {
                    if (i == 0) {
                        q.stt = token;
                    } else if (i == 1) {
                        q.question = token;
                    } else if (i < 6) {
                        q.answers[i - 2] = token;
                    } else if (i == 6) {
                        q.key = token;
                    } else if (i == 7) {
                        q.image = token;
                    } else if (i == 8) {
                        q.audio = token;
                    } else if (i == 9) {
                        q.check = token;
                    } else if (i == 10) {
                        q.trans = token;
                    } else if (i == 11) {
                        q.explain = token;
                    }
                    i++;
                }
                questions.push_back(q);
            }
        }
        file.close();
    }

    return questions;
}

void writeDataToFile(const vector<Question>& questions, const string& filename) {
    ofstream file(filename);
    if (file.is_open()) {
        for (const Question& q : questions) {
            file << "  {\n";
            file << "    \"question\": \"" << q.question << "\",\n";
            file << "    \"answers\": {\n";
            file << "      \"A\": \"" << q.answers[0] << "\",\n";
            file << "      \"B\": \"" << q.answers[1] << "\",\n";
            file << "      \"C\": \"" << q.answers[2] << "\",\n";
            file << "      \"D\": \"" << q.answers[3] << "\"\n";
            file << "    },\n";
            file << "    \"key\": \"" << q.key << "\",\n";
            file << "    \"image\": \"" << q.image << "\",\n";
            file << "    \"audio\": \"" << q.audio << "\",\n";
            file << "    \"check\": \"" << q.check << "\",\n";
            file << "    \"trans\": \"" << q.trans<< "\",\n";
            file << "    \"explain\": \"" << q.explain << "\"\n";
            file << "  },\n";
        }
        file.close();
    }
}

int main() {
    vector<Question> questions = readDataFromFile("./api.txt");
    writeDataToFile(questions, "./output.json");
    return 0;
}
